import NeteaseCloudMusicApi from "@neteasecloudmusicapienhanced/api"

import { config } from "@/config"
import { NETEASE_EAPI_DOMAIN } from "@/constants"
import type {
  NeteaseCloudSearchSongResult,
  NeteaseSong,
} from "@/core/api/interfaces"

export const searchSong = async (
  query: string,
  cookie?: string,
): Promise<NeteaseSong | null> => {
  return NeteaseCloudMusicApi.cloudsearch({
    keywords: query,
    type: 1,
    cookie,
    realIP: config.netease.realIp,
    domain: NETEASE_EAPI_DOMAIN,
  })
    .then((rawResult) => {
      const result = rawResult.body.result as NeteaseCloudSearchSongResult

      return result.songs[0] ?? null
    })
    .catch((error) => {
      console.error("❌ Error in search:", error)
      return null
    })
}
