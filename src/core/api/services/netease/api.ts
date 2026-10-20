import NeteaseCloudMusicApi from "@neteasecloudmusicapienhanced/api"

import { DISCORD_DROPDOWN_LIMIT } from "@/common/constants"
import { BambooError, ErrorKind } from "@/common/errors"
import { logger } from "@/common/utils/logger"
import {
  type Album,
  type MusicSource,
  type Playlist,
  type Song,
  SourceId,
  type User,
} from "@/core/api/interfaces"

import { request } from "./client"
import {
  ALBUM_LINK,
  NeteaseHost,
  PLAYLIST_LINK,
  SearchType,
  SONG_DETAIL_TRACKID_LIMIT,
  SONG_LINK,
} from "./constants"
import type {
  AlbumAnswer,
  AlbumSearchAnswer,
  LyricAnswer,
  PlaylistDetailAnswer,
  RawAlbum,
  RawPlaylist,
  RawSimilarSong,
  RawSong,
  SimilarSongsAnswer,
  SongDetailAnswer,
  SongSearchAnswer,
  SongUrlAnswer,
  UserPlaylistsAnswer,
  UserSearchAnswer,
} from "./types"

export const songIdFromLink = (link: string): string => {
  const id = new URL(link).searchParams.get("id")
  if (!id) throw new Error(`Not a NetEase song link: ${link}`)
  return id
}

const songOf = (raw: RawSong, thumbnail?: string): Song | null => {
  const artist = raw.ar?.[0]
  if (!artist || !raw.al) {
    logger.warn(`Skipped NetEase song ${raw.id} without an artist or album`)
    return null
  }
  return {
    id: String(raw.id),
    title: raw.name,
    artist: artist.name,
    durationMs: raw.dt,
    thumbnail: thumbnail ?? raw.al.picUrl,
    url: `${SONG_LINK}${raw.id}`,
  }
}

const songsOf = (raws: RawSong[], thumbnail?: string): Song[] =>
  raws.map((raw) => songOf(raw, thumbnail)).filter((song) => song !== null)

const similarSongOf = (raw: RawSimilarSong): Song | null => {
  const artist = raw.artists?.[0]
  if (!artist || !raw.album) {
    logger.warn(`Skipped NetEase song ${raw.id} without an artist or album`)
    return null
  }
  return {
    id: String(raw.id),
    title: raw.name,
    artist: artist.name,
    durationMs: raw.duration,
    thumbnail: raw.album.picUrl,
    url: `${SONG_LINK}${raw.id}`,
  }
}

const albumOf = (raw: RawAlbum): Album | null => {
  const artist = raw.artists[0]
  if (!artist) {
    logger.warn(`Skipped NetEase album ${raw.id} without an artist`)
    return null
  }
  return {
    id: String(raw.id),
    title: raw.name,
    artist: artist.name,
    songCount: raw.size,
    publishedAt: raw.publishTime,
    description: raw.description,
    thumbnail: raw.picUrl,
    url: `${ALBUM_LINK}${raw.id}`,
  }
}

const playlistOf = (raw: RawPlaylist): Playlist => ({
  id: String(raw.id),
  title: raw.name,
  description: raw.description ?? "",
  songCount: raw.trackCount,
  thumbnail: raw.coverImgUrl,
  ownerName: raw.creator?.nickname ?? "",
  ownerAvatar: raw.creator?.avatarUrl ?? "",
  url: `${PLAYLIST_LINK}${raw.id}`,
})

const searchSongs = async (query: string): Promise<Song[]> => {
  const { result } = await request<SongSearchAnswer>(
    NeteaseCloudMusicApi.cloudsearch,
    { keywords: query, type: SearchType.Song },
    NeteaseHost.Eapi,
  )
  return songsOf(result?.songs ?? [])
}

const streamUrlOf = async (id: string): Promise<string> => {
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

const relatedTo = async (
  id: string,
  playedIds: string[],
): Promise<Song | null> => {
  const { songs } = await request<SimilarSongsAnswer>(
    NeteaseCloudMusicApi.simi_song,
    { id },
    NeteaseHost.Default,
  )
  const candidates = (songs ?? [])
    .map(similarSongOf)
    .filter((song) => song !== null)
  return (
    candidates.find((song) => !playedIds.includes(song.id)) ??
    candidates.at(0) ??
    null
  )
}

export const lyricsOf = async (id: string): Promise<string | null> => {
  const { lrc } = await request<LyricAnswer>(
    NeteaseCloudMusicApi.lyric,
    { id },
    NeteaseHost.Eapi,
  )
  return lrc?.lyric || null
}

const searchAlbums = async (query: string): Promise<Album[]> => {
  const { result } = await request<AlbumSearchAnswer>(
    NeteaseCloudMusicApi.cloudsearch,
    { keywords: query, type: SearchType.Album },
    NeteaseHost.Eapi,
  )
  return (result?.albums ?? [])
    .slice(0, DISCORD_DROPDOWN_LIMIT)
    .map(albumOf)
    .filter((album) => album !== null)
}

export const albumWithSongs = async (id: string) => {
  const { album, songs } = await request<AlbumAnswer>(
    NeteaseCloudMusicApi.album,
    { id },
    NeteaseHost.Default,
  )
  if (!album?.id) throw new BambooError(ErrorKind.NotFound)
  const info = albumOf(album)
  if (!info) throw new BambooError(ErrorKind.NotFound)
  return {
    album: info,
    songs: songsOf(songs ?? [], album.picUrl),
  }
}

const searchUsers = async (query: string): Promise<User[]> => {
  const { result } = await request<UserSearchAnswer>(
    NeteaseCloudMusicApi.cloudsearch,
    { keywords: query, type: SearchType.User },
    NeteaseHost.Eapi,
  )
  return (result?.userprofiles ?? [])
    .slice(0, DISCORD_DROPDOWN_LIMIT)
    .map((raw) => ({
      id: String(raw.userId),
      name: raw.nickname,
    }))
}

export const playlistsOf = async (userId: string): Promise<Playlist[]> => {
  const { playlist } = await request<UserPlaylistsAnswer>(
    NeteaseCloudMusicApi.user_playlist,
    { uid: userId },
    NeteaseHost.Default,
  )
  return (playlist ?? []).slice(0, DISCORD_DROPDOWN_LIMIT).map(playlistOf)
}

export const playlistWithSongs = async (id: string) => {
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
  return {
    playlist: playlistOf(playlist),
    songs: songsOf(details.flatMap(({ songs }) => songs)),
  }
}

export const netease = {
  id: SourceId.Netease,
  searchSongs,
  getStreamUrl: (song) => streamUrlOf(song.id),
  findRelated: (song, played) =>
    relatedTo(
      song.id,
      played.map((other) => other.id),
    ),
  getLyrics: (song) => lyricsOf(song.id),
  albums: {
    search: searchAlbums,
    getSongs: async (album) => (await albumWithSongs(album.id)).songs,
  },
  users: {
    search: searchUsers,
    getPlaylists: (user) => playlistsOf(user.id),
    getPlaylistSongs: async (playlist) =>
      (await playlistWithSongs(playlist.id)).songs,
  },
} satisfies MusicSource
