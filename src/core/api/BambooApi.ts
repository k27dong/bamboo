import type { Track } from "discord-player"

import { ApiServiceType } from "@/common/constants"
import type {
  BambooMusicApi,
  BilibiliVideo,
  NeteaseAlbumDetailed,
  NeteasePlaylistSearchResult,
  NeteasePlaylistTracks,
  NeteaseSong,
  NeteaseUserProfile,
} from "@/core/api/interfaces"
import { BilibiliService } from "@/core/api/services/bilibili"
import { NeteaseService } from "@/core/api/services/netease"

export class BambooApi implements BambooMusicApi {
  private services: Record<ApiServiceType, BambooMusicApi>

  constructor(cookies?: Record<ApiServiceType, string>) {
    this.services = {
      [ApiServiceType.Netease]: new NeteaseService(
        cookies?.[ApiServiceType.Netease],
      ),
      [ApiServiceType.Bilibili]: new BilibiliService(),
    }
  }

  private getService(source: ApiServiceType): BambooMusicApi {
    const service = this.services[source]
    if (!service) {
      throw new Error(`Unsupported source: ${source}`)
    }
    return service
  }

  async getTrackUrl(
    track: Track,
    source: ApiServiceType = ApiServiceType.Netease,
  ): Promise<string> {
    const service = this.getService(source)
    return service.getTrackUrl(track)
  }

  async getDefaultTrack(
    query: string,
    source: ApiServiceType = ApiServiceType.Netease,
  ): Promise<NeteaseSong | null> {
    const service = this.getService(source)
    return await service.getDefaultTrack(query)
  }

  async searchAlbum(
    query: string,
    source: ApiServiceType = ApiServiceType.Netease,
  ): Promise<NeteaseAlbumDetailed[] | null> {
    const service = this.getService(source)
    return await service.searchAlbum(query)
  }

  async getAlbumById(
    id: string,
    source: ApiServiceType = ApiServiceType.Netease,
  ): Promise<NeteaseSong[] | null> {
    const service = this.getService(source)
    return await service.getAlbumById(id)
  }

  async getLyricById(
    id: string,
    source: ApiServiceType = ApiServiceType.Netease,
  ): Promise<string | null> {
    const service = this.getService(source)
    return await service.getLyricById(id)
  }

  async searchUser(
    query: string,
    source: ApiServiceType = ApiServiceType.Netease,
  ): Promise<NeteaseUserProfile[] | null> {
    const service = this.getService(source)
    return await service.searchUser(query)
  }

  async getUserPlaylists(
    query: string,
    source: ApiServiceType = ApiServiceType.Netease,
  ): Promise<NeteasePlaylistSearchResult[] | null> {
    const service = this.getService(source)
    return await service.getUserPlaylists(query)
  }

  async getUserPlaylistTracksById(
    id: string,
    source: ApiServiceType = ApiServiceType.Netease,
  ): Promise<NeteasePlaylistTracks | null> {
    const service = this.getService(source)
    return await service.getUserPlaylistTracksById(id)
  }

  async getSimilarTrack(
    id: string,
    prevTracks: string[],
    source: ApiServiceType = ApiServiceType.Netease,
  ): Promise<NeteaseSong | null> {
    const service = this.getService(source)
    return await service.getSimilarTrack(id, prevTracks)
  }

  async getVideoInfo(
    id: string,
    source: ApiServiceType = ApiServiceType.Bilibili,
  ): Promise<BilibiliVideo | null> {
    const service = this.getService(source)
    return await service.getVideoInfo(id)
  }
}
