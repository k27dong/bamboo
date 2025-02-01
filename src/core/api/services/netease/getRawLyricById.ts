import NeteaseCloudMusicApi from "NeteaseCloudMusicApi"

import { REAL_IP } from "@/common/utils/config"
import type { NeteaseLyric } from "@/core/api/interfaces"

export const getRawLyricById = async (
  id: string,
  cookie?: string,
): Promise<string> => {
  return NeteaseCloudMusicApi.lyric({
    id: id,
    cookie,
    realIP: REAL_IP,
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
