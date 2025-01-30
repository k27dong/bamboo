import type { Track } from "discord-player"

import type { BambooMusicApi, NeteaseSong } from "@/core/api/interfaces"

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
}
