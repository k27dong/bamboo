import type { Track } from "discord-player"

import type { BambooMusicApi, BilibiliVideo } from "@/core/api/interfaces"

import { getVideoInfo } from "./getVideoInfo"
import { getVideoUrl } from "./getVideoUrl"

export class BilibiliService implements BambooMusicApi {
  async getVideoInfo(bvid: string): Promise<BilibiliVideo | null> {
    return getVideoInfo(bvid)
  }

  async getTrackUrl(track: Track): Promise<string> {
    return getVideoUrl(track)
  }

  async getDefaultTrack(): Promise<null> {
    return await Promise.resolve(null)
  }

  async getSimilarTrack(): Promise<null> {
    return await Promise.resolve(null)
  }

  async searchAlbum(): Promise<any[] | null> {
    return await Promise.resolve(null)
  }

  async getAlbumById(): Promise<any[] | null> {
    return await Promise.resolve(null)
  }

  async getLyricById(): Promise<string | null> {
    return await Promise.resolve(null)
  }

  async searchUser(): Promise<any[] | null> {
    return await Promise.resolve(null)
  }

  async getUserPlaylists(): Promise<any[] | null> {
    return await Promise.resolve(null)
  }

  async getUserPlaylistTracksById(): Promise<any> {
    return await Promise.resolve(null)
  }
}
