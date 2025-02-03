import NeteaseCloudMusicApi from "NeteaseCloudMusicApi"

import { REAL_IP } from "@/common/utils/config"
import type { NeteaseAlbumSearchInfo, NeteaseSong } from "@/core/api/interfaces"

export const getAlbumSongs = async (
  query: string,
  cookie?: string,
): Promise<NeteaseSong[] | null> => {
  return NeteaseCloudMusicApi.album({
    id: query,
    cookie,
    realIP: REAL_IP,
  })
    .then((rawResult) => {
      const songs = rawResult.body.songs as NeteaseSong[]
      const albumInfo = rawResult.body.album as NeteaseAlbumSearchInfo

      for (const song of songs) {
        song.al.picUrl = albumInfo.picUrl
        song.al.description = albumInfo.description
        song.publishTime = albumInfo.publishTime
      }

      return songs ?? null
    })
    .catch((error) => {
      console.error("❌ Error in search:", error)
      return null
    })
}
