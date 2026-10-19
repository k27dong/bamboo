import NeteaseCloudMusicApi from "@neteasecloudmusicapienhanced/api"

import { NETEASE_EAPI_DOMAIN } from "@/common/constants"
import { config } from "@/common/utils/config"
import type { NeteaseLyric } from "@/core/api/interfaces"

export const getRawLyricById = async (
  id: string,
  cookie?: string,
): Promise<string> => {
  return NeteaseCloudMusicApi.lyric({
    id: id,
    cookie,
    realIP: config.netease.realIp,
    domain: NETEASE_EAPI_DOMAIN,
  })
    .then((rawResult) => {
      const result = rawResult.body.lrc as NeteaseLyric

      return result.lyric ?? ""
    })
    .catch((error) => {
      console.error("❌ Error in search:", error)
      return ""
    })
}
