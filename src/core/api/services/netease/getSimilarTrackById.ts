import NeteaseCloudMusicApi from "NeteaseCloudMusicApi"

import { REAL_IP } from "@/common/utils/config"
import type { NeteaseSimilarTrack, NeteaseSong } from "@/core/api/interfaces"

export const getSimilarTrackById = async (
  id: string,
  history: string[],
  cookie?: string,
): Promise<NeteaseSong | null> => {
  return NeteaseCloudMusicApi.simi_song({
    id: id,
    cookie,
    realIP: REAL_IP,
  })
    .then((rawResult) => {
      const result = rawResult.body.songs as NeteaseSimilarTrack[]

      if (!result || result.length === 0) {
        return null
      }

      const selectedTrack =
        result.find(
          (similarTrack) => !history.includes(String(similarTrack.id)),
        ) ?? result[0]

      const track: NeteaseSong = {
        name: selectedTrack.name,
        id: selectedTrack.id,
        ar: selectedTrack.artists,
        al: selectedTrack.album,
        dt: selectedTrack.duration,
        publishTime: selectedTrack.publishTime, //
        pop: selectedTrack.popularity,
        fee: selectedTrack.fee,
        s_id: 0,
      }

      return track ?? null
    })
    .catch((error) => {
      console.error("❌ Error in search:", error)
      return null
    })
}
