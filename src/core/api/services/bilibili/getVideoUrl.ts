import type { Track } from "discord-player"

import type { BVideoMetadata } from "@/env"

export const getVideoUrl = async (track: Track): Promise<string> => {
  try {
    const cid = (track.metadata as BVideoMetadata).cid
    if (!cid) {
      throw new Error("No CID found in track metadata")
    }

    const mp3Url = `https://api.bilibili.com/x/player/wbi/playurl?fnval=1&fnver=0&type=3&platform=html5&bvid=${track.url}&cid=${cid}`

    const audioData = (await fetch(mp3Url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Referer: "https://www.bilibili.com/",
      },
    }).then((res) => res.json())) as {
      code: number
      message?: string
      data?: {
        durl?: Array<{
          url: string
          size: number
          backup_url?: string[]
        }>
      }
    }

    if (audioData?.data?.durl?.[0]?.url) {
      console.log("audio url returned", audioData.data.durl[0].url)
      return audioData.data.durl[0].url
    }

    throw new Error("Could not extract audio URL from Bilibili API response")
  } catch (error) {
    console.error("❌ Error getting Bilibili video URL:", error)
    return `https://bilibili-audio-proxy.vercel.app/api/audio?bvid=${track.url}`
  }
}
