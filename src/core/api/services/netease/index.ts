import type { Track } from "discord-player"

import type {
  BambooMusicApi,
  NeteaseAlbumDetailed,
  NeteaseSong,
} from "@/core/api/interfaces"

import { getAlbumList } from "./getAlbumList"
import { getAlbumSongs } from "./getAlbumSongs"
import { getSongUrlByTrack } from "./getTrackUrl"
import { searchSong } from "./searchSong"

export class NeteaseService implements BambooMusicApi {
  private cookie?: string

  constructor(cookie?: string) {
    this.cookie = cookie
  }

  async getTrackUrl(track: Track): Promise<string> {
    return getSongUrlByTrack(track, this.cookie)
  }

  async getDefaultTrack(query: string): Promise<NeteaseSong | null> {
    return searchSong(query, this.cookie)
  }

  async searchAlbum(query: string): Promise<NeteaseAlbumDetailed[] | null> {
    return getAlbumList(query, this.cookie)
  }

  async getAlbumById(id: string): Promise<NeteaseSong[] | null> {
    return getAlbumSongs(id, this.cookie)
  }
}
