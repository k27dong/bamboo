import NeteaseCloudMusicApi from "@neteasecloudmusicapienhanced/api"

import { config } from "@/config"
import { DISCORD_DROPDOWN_LIMIT } from "@/constants"
import type { NeteasePlaylistSearchResult } from "@/core/api/interfaces"

export const getPlaylistsByUserId = async (
  id: string,
  cookie?: string,
): Promise<NeteasePlaylistSearchResult[] | null> => {
  return NeteaseCloudMusicApi.user_playlist({
    uid: id,
    cookie,
    realIP: config.netease.realIp,
  })
    .then((rawResult) => {
      const result = rawResult.body.playlist as NeteasePlaylistSearchResult[]

      return result.slice(0, DISCORD_DROPDOWN_LIMIT) ?? null
    })
    .catch((error) => {
      console.error("❌ Error in search:", error)
      return null
    })
}
