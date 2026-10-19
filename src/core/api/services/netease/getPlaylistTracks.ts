import NeteaseCloudMusicApi from "@neteasecloudmusicapienhanced/api"

import { config } from "@/config"
import { NETEASE_EAPI_DOMAIN, SONG_DETAIL_TRACKID_LIMIT } from "@/constants"
import type {
  NeteasePlaylistDetailSearchResult,
  NeteasePlaylistTracks,
} from "@/core/api/interfaces"

export const getPlaylistTracks = async (
  id: string,
  cookie?: string,
): Promise<NeteasePlaylistTracks | null> => {
  try {
    const rawResult = await NeteaseCloudMusicApi.playlist_detail({
      id: id,
      cookie,
      realIP: config.netease.realIp,
      domain: NETEASE_EAPI_DOMAIN,
    })

    const result = rawResult.body.playlist as NeteasePlaylistDetailSearchResult
    const trackIds = result.trackIds.map((track: { id: string }) => track.id)

    const trackIdInChunks = Array.from(
      { length: Math.ceil(trackIds.length / SONG_DETAIL_TRACKID_LIMIT) },
      (_, i) =>
        trackIds.slice(
          i * SONG_DETAIL_TRACKID_LIMIT,
          i * SONG_DETAIL_TRACKID_LIMIT + SONG_DETAIL_TRACKID_LIMIT,
        ),
    )

    const songDetailRequests = trackIdInChunks.map((chunk) =>
      NeteaseCloudMusicApi.song_detail({
        ids: chunk.join(","),
        cookie,
        realIP: config.netease.realIp,
      }),
    )

    const rawSongDetails = await Promise.all(songDetailRequests)

    const tracks = rawSongDetails.flatMap((res) => res.body.songs)

    return {
      info: result,
      tracks: tracks,
    }
  } catch (error) {
    console.error("❌ Error in search:", error)
    return null
  }
}
