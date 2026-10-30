import NeteaseCloudMusicApi from "@neteasecloudmusicapienhanced/api"

import { DISCORD_DROPDOWN_LIMIT } from "@/shared/constants"
import { BambooError, ErrorKind } from "@/shared/errors"
import { logger } from "@/shared/logger"

import { request } from "./client"
import { NeteaseHost, SearchType, SONG_DETAIL_TRACKID_LIMIT } from "./constants"
import type {
  AlbumAnswer,
  AlbumSearchAnswer,
  LyricAnswer,
  NeteaseAlbum,
  NeteaseAlbumWithArtist,
  NeteasePlaylist,
  NeteaseSong,
  NeteaseUser,
  PlaylistDetailAnswer,
  SimilarSongsAnswer,
  SongDetailAnswer,
  SongSearchAnswer,
  SongUrlAnswer,
  UserPlaylistsAnswer,
  UserSearchAnswer,
} from "./types"

export const idFromLink = (link: string): string => {
  const id = new URL(link).searchParams.get("id")
  if (!id) throw new Error(`Not a NetEase link: ${link}`)
  return id
}

const hasArtist = (album: NeteaseAlbum): album is NeteaseAlbumWithArtist => {
  if (album.artists.length > 0) return true
  logger.warn(`Skipped NetEase album ${album.id} without an artist`)
  return false
}

export const searchSongs = async (query: string): Promise<NeteaseSong[]> => {
  const { result } = await request<SongSearchAnswer>(
    NeteaseCloudMusicApi.cloudsearch,
    { keywords: query, type: SearchType.Song },
    NeteaseHost.Eapi,
  )
  return result?.songs ?? []
}

export const getSongUrl = async (id: string): Promise<string> => {
  const { data } = await request<SongUrlAnswer>(
    NeteaseCloudMusicApi.song_url_v1,
    { id: Number(id), level: "standard", crypto: "eapi" },
    NeteaseHost.Eapi,
  )
  const url = data?.[0]?.url
  if (!url) {
    logger.warn(`NetEase gave no link for song ${id}`)
    throw new BambooError(ErrorKind.Unplayable)
  }
  return url
}

export const getSimilarSongs = async (id: string): Promise<NeteaseSong[]> => {
  const { songs } = await request<SimilarSongsAnswer>(
    NeteaseCloudMusicApi.simi_song,
    { id },
    NeteaseHost.Default,
  )
  // simi_song still answers with NetEase's older song fields
  return (songs ?? []).map((song) => ({
    id: song.id,
    name: song.name,
    dt: song.duration,
    ar: song.artists,
    al: song.album,
  }))
}

export const getLyric = async (id: string): Promise<string | null> => {
  const { lrc } = await request<LyricAnswer>(
    NeteaseCloudMusicApi.lyric,
    { id },
    NeteaseHost.Eapi,
  )
  return lrc?.lyric || null
}

export const searchAlbums = async (
  query: string,
): Promise<NeteaseAlbumWithArtist[]> => {
  const { result } = await request<AlbumSearchAnswer>(
    NeteaseCloudMusicApi.cloudsearch,
    { keywords: query, type: SearchType.Album },
    NeteaseHost.Eapi,
  )
  return (result?.albums ?? [])
    .slice(0, DISCORD_DROPDOWN_LIMIT)
    .filter(hasArtist)
}

export const getAlbumWithSongs = async (id: string) => {
  const { album, songs } = await request<AlbumAnswer>(
    NeteaseCloudMusicApi.album,
    { id },
    NeteaseHost.Default,
  )
  if (!album?.id || !hasArtist(album)) throw new BambooError(ErrorKind.NotFound)
  return { album, songs: songs ?? [] }
}

export const searchUsers = async (query: string): Promise<NeteaseUser[]> => {
  const { result } = await request<UserSearchAnswer>(
    NeteaseCloudMusicApi.cloudsearch,
    { keywords: query, type: SearchType.User },
    NeteaseHost.Eapi,
  )
  return (result?.userprofiles ?? []).slice(0, DISCORD_DROPDOWN_LIMIT)
}

export const getUserPlaylists = async (
  userId: string,
): Promise<NeteasePlaylist[]> => {
  const { playlist } = await request<UserPlaylistsAnswer>(
    NeteaseCloudMusicApi.user_playlist,
    { uid: userId },
    NeteaseHost.Default,
  )
  return (playlist ?? []).slice(0, DISCORD_DROPDOWN_LIMIT)
}

export const getPlaylistWithSongs = async (id: string) => {
  const { playlist } = await request<PlaylistDetailAnswer>(
    NeteaseCloudMusicApi.playlist_detail,
    { id },
    NeteaseHost.Eapi,
  )
  if (!playlist?.id) throw new BambooError(ErrorKind.NotFound)
  const ids = playlist.trackIds.map((track) => track.id)
  const chunks = Array.from(
    { length: Math.ceil(ids.length / SONG_DETAIL_TRACKID_LIMIT) },
    (_, i) =>
      ids.slice(
        i * SONG_DETAIL_TRACKID_LIMIT,
        (i + 1) * SONG_DETAIL_TRACKID_LIMIT,
      ),
  )
  const details = await Promise.all(
    chunks.map((chunk) =>
      request<SongDetailAnswer>(
        NeteaseCloudMusicApi.song_detail,
        { ids: chunk.join(",") },
        NeteaseHost.Default,
      ),
    ),
  )
  return { playlist, songs: details.flatMap(({ songs }) => songs) }
}
