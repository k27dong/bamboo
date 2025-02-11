import NeteaseCloudMusicApi, { type SearchType } from "NeteaseCloudMusicApi"

import { DISCORD_DROPDOWN_LIMIT } from "@/common/constants"
import { REAL_IP } from "@/common/utils/config"
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
    type: 1002 as SearchType,
    cookie,
    realIP: REAL_IP,
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
