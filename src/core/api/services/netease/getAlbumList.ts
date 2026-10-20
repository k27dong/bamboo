import NeteaseCloudMusicApi from "@neteasecloudmusicapienhanced/api"

import { DISCORD_DROPDOWN_LIMIT, NETEASE_EAPI_DOMAIN } from "@/common/constants"
import { config } from "@/common/utils/config"
import type {
  NeteaseAlbumDetailed,
  NeteaseCloudSearchAlbumResult,
} from "@/core/api/interfaces"

export const getAlbumList = async (
  query: string,
  cookie?: string,
): Promise<NeteaseAlbumDetailed[] | null> => {
  return NeteaseCloudMusicApi.cloudsearch({
    keywords: query,
    type: 10,
    cookie,
    realIP: config.netease.realIp,
    domain: NETEASE_EAPI_DOMAIN,
  })
    .then((rawResult) => {
      const result = rawResult.body.result as NeteaseCloudSearchAlbumResult

      return result.albums?.slice(0, DISCORD_DROPDOWN_LIMIT) ?? null
    })
    .catch((error) => {
      console.error("❌ Error in search:", error)
      return null
    })
}
