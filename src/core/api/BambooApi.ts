import type { Track } from "discord-player"

import { ApiServiceType } from "@/common/constants"
import type { BambooMusicApi, NeteaseSong } from "@/core/api/interfaces"

import { NeteaseService } from "./services/netease"

export class BambooApi implements BambooMusicApi {
  private services: Record<ApiServiceType, BambooMusicApi>

  constructor(cookies?: Record<ApiServiceType, string>) {
    this.services = {
      [ApiServiceType.Netease]: new NeteaseService(
        cookies?.[ApiServiceType.Netease],
      ),
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
}
