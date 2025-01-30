import {
  BaseExtractor,
  QueryType,
  type SearchQueryType,
  type Track,
} from "discord-player"

import type { ApiServiceType } from "@/common/constants"

import { BambooApi } from "../api/BambooApi"

export class BambooExtractor extends BaseExtractor {
  static override identifier = "com.k27dong.bamboo.bamboo-extractor" as const

  private api: BambooApi | null = null

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
    if (typeof query !== "string") return Promise.resolve(false)
    return Promise.resolve(
      ([QueryType.AUTO, QueryType.AUTO_SEARCH] as SearchQueryType[]).some(
        (r) => r === queryType,
      ),
    )
  }

  // TODO
  // discord-player calls this method when it wants a search result. It is called with the search query and a context parameter (options passed to player.search() method)
  // override async handle(query, context): Promise<ExtractorInfo> {
  //   // if query contained protocol, you can access that protocol via context.protocol
  //   return this.createResponse(playlist | null, [tracks])
  // }

  // // discord-player calls this method when it wants you to stream a track. You can either return raw url pointing at a stream or node.js readable stream object. Note: this method wont be called if onBeforeCreateStream was used. It is called with discord-player track object.
  // override async stream(track: Track): Promise<string> {

  // }

  // // discord-player calls this method when it wants some tracks for autoplay mode.
  // override async getRelatedTracks(track): Promise<ExtractorInfo> {
  //   return this.createResponse(null, [tracks])
  // }
}
