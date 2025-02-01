import NeteaseCloudMusicApi, { type SearchType } from "NeteaseCloudMusicApi"

import { DISCORD_DROPDOWN_LIMIT } from "@/common/constants"
import { REAL_IP } from "@/common/utils/config"
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
    type: 10 as SearchType,
    cookie,
    realIP: REAL_IP,
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
