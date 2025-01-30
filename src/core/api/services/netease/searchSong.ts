import NeteaseCloudMusicApi from "NeteaseCloudMusicApi"

import { REAL_IP } from "@/common/utils/config"

import { SearchType } from "./types"

export const searchSong = async (query: string, cookie?: string) => {
  try {
    const result = await NeteaseCloudMusicApi.cloudsearch({
      keywords: query,
      type: SearchType.single as number,
      cookie,
      realIP: REAL_IP,
    })

    console.log(result)

    return result
  } catch (error) {
    console.error("❌ Error in search:", error)
    return null
  }
}
