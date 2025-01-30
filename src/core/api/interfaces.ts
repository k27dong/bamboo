import type { Track } from "discord-player"

export interface BambooMusicApi {
  getTrackUrl: (id: Track) => Promise<string>
  getDefaultTrack: (query: string) => Promise<NeteaseSong | null>
}

export interface NeteaseCloudSearchSongResult {
  searchQcReminder: any
  songs: any
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
}

export interface NeteaseSongPlayable {
  id: number
  url: string
  size: number
  code: number
  type: string
  fee: NeteaseFeeType
}
