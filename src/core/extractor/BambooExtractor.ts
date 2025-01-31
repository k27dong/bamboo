import {
  BaseExtractor,
  type ExtractorInfo,
  type ExtractorSearchContext,
  QueryType,
  type SearchQueryType,
  Track,
} from "discord-player"

import type { ApiServiceType } from "@/common/constants"
import { millisecondsToTimeString } from "@/common/utils/common"
import { BambooApi } from "@/core/api/BambooApi"
import type { NeteaseSong } from "@/core/api/interfaces"

export class BambooExtractor extends BaseExtractor {
  static override identifier = "com.k27dong.bamboo.bamboo-extractor" as const

  private api: BambooApi | null = null

  private isDirectUrl(query: string): boolean {
    try {
      new URL(query)
      return true
    } catch {
      return false
    }
  }

  public override createBridgeQuery = (track: Track) =>
    `${track.title} by ${track.author} official audio`

  override async activate(): Promise<void> {
    const initOptions = this.options as {
      cookies?: Record<ApiServiceType, string>
    }

    const cookies = initOptions?.cookies
    this.api = new BambooApi(cookies)

    // const player = this.context.player
    this.protocols = ["bamboo"]
    await Promise.resolve()
  }

  override async deactivate(): Promise<void> {
    this.api = null
    this.protocols = []
    await Promise.resolve()
  }

  override validate(
    query: string,
    queryType?: SearchQueryType,
  ): Promise<boolean> {
    if (typeof query !== "string" || this.isDirectUrl(query))
      return Promise.resolve(false)

    return Promise.resolve(
      ([QueryType.AUTO, QueryType.AUTO_SEARCH] as SearchQueryType[]).some(
        (r) => r === queryType,
      ),
    )
  }

  override async handle(
    query: string,
    context: ExtractorSearchContext,
  ): Promise<ExtractorInfo> {
    if (!this.api) throw new Error("Extractor not activated")

    const rawTrack = await this.api.getDefaultTrack(query)
    if (!rawTrack) throw new Error("Failed to get track")

    const track = this.buildTrack(rawTrack, context)

    return this.createResponse(null, [track])
  }

  override async stream(track: Track): Promise<string> {
    if (!this.api) throw new Error("Extractor not activated")

    const streamUrl = await this.api.getTrackUrl(track)
    if (!streamUrl) throw new Error("Failed to get stream URL")

    return streamUrl
  }

  // discord-player calls this method when it wants some tracks for autoplay mode.
  // override async getRelatedTracks(track): Promise<ExtractorInfo> {
  //   return this.createResponse(null, [tracks])
  // }

  buildTrack(info: NeteaseSong, context: ExtractorSearchContext): Track {
    return new Track(this.context.player, {
      title: info.name,
      url: `${info.id}`,
      duration: millisecondsToTimeString(info.dt),
      thumbnail: info.al.picUrl,
      author: info.ar[0].name,
      requestedBy: context.requestedBy,
      source: "arbitrary",
      queryType: context.type!,
      metadata: info,
      requestMetadata: () => Promise.resolve(info),
    })
  }
}
