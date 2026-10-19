import NeteaseCloudMusicApi from "@neteasecloudmusicapienhanced/api"

import { BambooError, ErrorKind } from "@/errors"
import {
  type Album,
  type MusicSource,
  type Playlist,
  type Song,
  SourceId,
  type User,
} from "@/sources/source"

import { NeteaseHost, request } from "./client"
import {
  ALBUM_LINK,
  PLAYLIST_LINK,
  SEARCH_TYPE,
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

const songOf = (raw: RawSong, thumbnail = raw.al.picUrl): Song => ({
  id: String(raw.id),
  title: raw.name,
  artist: raw.ar[0].name,
  durationMs: raw.dt,
  thumbnail,
  url: `${SONG_LINK}${raw.id}`,
})

const similarSongOf = (raw: RawSimilarSong): Song => ({
  id: String(raw.id),
  title: raw.name,
  artist: raw.artists[0].name,
  durationMs: raw.duration,
  thumbnail: raw.album.picUrl,
  url: `${SONG_LINK}${raw.id}`,
})

const albumOf = (raw: RawAlbum): Album => ({
  id: String(raw.id),
  title: raw.name,
  artist: raw.artists[0].name,
  songCount: raw.size,
  publishedAt: raw.publishTime,
  description: raw.description,
  thumbnail: raw.picUrl,
  url: `${ALBUM_LINK}${raw.id}`,
})

const playlistOf = (raw: RawPlaylist): Playlist => ({
  id: String(raw.id),
  title: raw.name,
  description: raw.description ?? "",
  songCount: raw.trackCount,
  thumbnail: raw.coverImgUrl,
  ownerName: raw.creator.nickname,
  ownerAvatar: raw.creator.avatarUrl,
  url: `${PLAYLIST_LINK}${raw.id}`,
})

const searchSongs = async (query: string): Promise<Song[]> => {
  const { result } = await request<SongSearchAnswer>(
    NeteaseCloudMusicApi.cloudsearch,
    { keywords: query, type: SEARCH_TYPE.SONG },
    NeteaseHost.Eapi,
  )
  return (result?.songs ?? []).map((raw) => songOf(raw))
}

const streamUrlOf = async (id: string): Promise<string> => {
  const { data } = await request<SongUrlAnswer>(
    NeteaseCloudMusicApi.song_url_v1,
    { id: Number(id), level: "standard", crypto: "eapi" },
    NeteaseHost.Eapi,
  )
  const url = data?.[0]?.url
  if (!url) throw new BambooError(ErrorKind.Unplayable)
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
  const picked =
    songs?.find((song) => !playedIds.includes(String(song.id))) ?? songs?.[0]
  return picked ? similarSongOf(picked) : null
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
    { keywords: query, type: SEARCH_TYPE.ALBUM },
    NeteaseHost.Eapi,
  )
  return (result?.albums ?? []).map(albumOf)
}

export const albumWithSongs = async (id: string) => {
  const { album, songs } = await request<AlbumAnswer>(
    NeteaseCloudMusicApi.album,
    { id },
    NeteaseHost.Default,
  )
  if (!album?.id) throw new BambooError(ErrorKind.NotFound)
  return {
    album: albumOf(album),
    songs: (songs ?? []).map((raw) => songOf(raw, album.picUrl)),
  }
}

const searchUsers = async (query: string): Promise<User[]> => {
  const { result } = await request<UserSearchAnswer>(
    NeteaseCloudMusicApi.cloudsearch,
    { keywords: query, type: SEARCH_TYPE.USER },
    NeteaseHost.Eapi,
  )
  return (result?.userprofiles ?? []).map((raw) => ({
    id: String(raw.userId),
    name: raw.nickname,
    avatar: raw.avatarUrl,
  }))
}

export const playlistsOf = async (userId: string): Promise<Playlist[]> => {
  const { playlist } = await request<UserPlaylistsAnswer>(
    NeteaseCloudMusicApi.user_playlist,
    { uid: userId },
    NeteaseHost.Default,
  )
  return (playlist ?? []).map(playlistOf)
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
    songs: details.flatMap(({ songs }) => songs.map((raw) => songOf(raw))),
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
