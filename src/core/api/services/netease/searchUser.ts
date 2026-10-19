import NeteaseCloudMusicApi from "@neteasecloudmusicapienhanced/api"

import { DISCORD_DROPDOWN_LIMIT, NETEASE_EAPI_DOMAIN } from "@/common/constants"
import { config } from "@/config"
import type {
  NeteaseCloudSearchUserResult,
  NeteaseUserProfile,
} from "@/core/api/interfaces"

export const searchUser = async (
  query: string,
  cookie?: string,
): Promise<NeteaseUserProfile[] | null> => {
  return NeteaseCloudMusicApi.cloudsearch({
    keywords: query,
    type: 1002,
    cookie,
    realIP: config.netease.realIp,
    domain: NETEASE_EAPI_DOMAIN,
  })
    .then((rawResult) => {
      const result = rawResult.body.result as NeteaseCloudSearchUserResult

      return result.userprofiles.slice(0, DISCORD_DROPDOWN_LIMIT) ?? null
    })
    .catch((error) => {
      console.error("❌ Error in search:", error)
      return null
    })
}
