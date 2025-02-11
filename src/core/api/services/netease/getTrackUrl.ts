import type { Track } from "discord-player"
import type { SoundQualityType } from "NeteaseCloudMusicApi"
import NeteaseCloudMusicApi from "NeteaseCloudMusicApi"

import { REAL_IP } from "@/common/utils/config"
import type { NeteaseSongPlayable } from "@/core/api/interfaces"

export const getSongUrlByTrack = async (
  track: Track,
  cookie?: string,
): Promise<string> => {
  return NeteaseCloudMusicApi.song_url_v1({
    id: Number(track.url),
    level: "standard" as SoundQualityType,
    cookie,
    realIP: REAL_IP,
  })
    .then((rawResult) => {
      const result = rawResult.body.data as NeteaseSongPlayable[]
      return result[0].url
    })
    .catch((error) => {
      console.error("❌ Error in search:", error)
      return ""
    })
}
