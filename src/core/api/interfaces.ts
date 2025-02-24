import type { Track } from "discord-player"
import type { SongDetail } from "NeteaseCloudMusicApi"

export interface BambooMusicApi {
  getTrackUrl: (id: Track) => Promise<string>
  getDefaultTrack: (query: string) => Promise<NeteaseSong | null>
  searchAlbum: (query: string) => Promise<NeteaseAlbumDetailed[] | null>
  getAlbumById: (id: string) => Promise<NeteaseSong[] | null>
  getLyricById: (id: string) => Promise<string | null>
  searchUser: (query: string) => Promise<NeteaseUserProfile[] | null>
  getUserPlaylists: (
    query: string,
  ) => Promise<NeteasePlaylistSearchResult[] | null>
  getUserPlaylistTracksById: (
    id: string,
  ) => Promise<NeteasePlaylistTracks | null>
}

export interface NeteaseCloudSearchSongResult {
  searchQcReminder: any
  songs: NeteaseSong[]
  songCount: number
}

export enum NeteaseFeeType {
  FREE_OR_NONE = 0,
  VIP = 1,
  PREMIUM_ALBUM = 3,
  LOW_QUALITY = 8,
}

export interface NeteaseAlbum {
  id: number
  name: string
  picUrl: string
  description: string
}

export interface NeteaseAlbumDetailed extends NeteaseAlbum {
  size: number
  pic: number
  publishTime: number
  artists: NeteaseArtist[]
}

export interface NeteaseArtist {
  id: number
  name: string
}

export interface NeteaseSong {
  name: string
  id: number
  ar: NeteaseArtist[]
  pop: number // popularity
  fee: NeteaseFeeType
  al: NeteaseAlbum
  dt: number // duration
  publishTime: number
  s_id: number // to indicate if the song is from clouddisk
}

export interface NeteaseSongPlayable {
  id: number
  url: string
  size: number
  code: number
  type: string
  fee: NeteaseFeeType
}

export interface NeteaseCloudSearchAlbumResult {
  albums: NeteaseAlbumDetailed[]
  albumCount: number
}

export interface NeteaseAlbumSearchInfo {
  picUrl: string
  description: string
  publishTime: number
}

export interface NeteaseLyric {
  version: number
  lyric: string
}

export interface NeteaseUserProfile {
  defaultAvatar: boolean
  avatarUrl: string
  userId: number
  nickname: string
  signature: string
  playlistCount: number
}

export interface NeteaseCloudSearchUserResult {
  userprofiles: NeteaseUserProfile[]
  userprofileCount: number
}

export interface NeteasePlaylistSearchResult {
  trackCount: number
  coverImgUrl: string
  playCount: number
  name: string
  id: number
}

export interface NeteasePlaylistDetailSearchResult {
  id: number
  name: string
  coverImgUrl: string
  userId: number
  createTime: number
  playCount: number
  description: string
  trackIds: any[]
  creator: NeteaseUserProfile
}

export interface NeteasePlaylistTracks {
  info: NeteasePlaylistDetailSearchResult
  tracks: SongDetail[]
}
