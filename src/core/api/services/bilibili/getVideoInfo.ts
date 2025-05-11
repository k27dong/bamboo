import { BILIBILI_ERROR_CODES } from "@/common/constants"
import { timestampToDate } from "@/common/utils/common"
import type { BilibiliApiResponse, BilibiliVideo } from "@/core/api/interfaces"

interface BilibiliVideoData {
  bvid: string
  videos: number // Total number of parts
  pic: string // Cover image URL
  title: string
  pubdate: number // Publish timestamp
  desc: string // Description
  duration: number // Total duration in seconds
  owner: {
    mid: number
    name: string
    face: string
  }
  pages: {
    cid: number
    page: number
    part: string
    duration: number
  }[]
}

export const getVideoInfo = async (
  videoId: string,
): Promise<BilibiliVideo | null> => {
  try {
    const errorResponse = {
      bvid: videoId,
      title: "Error",
      author: "Unknown",
      authorImg: "",
      duration: 0,
      cover: "",
      uploadTime: new Date().toISOString(),
      description: "",
      statusCode: BILIBILI_ERROR_CODES.UNKNOWN_ERROR,
      parts: [
        {
          cid: 0,
          partTitle: "Error",
          duration: 0,
          pageIndex: 0,
        },
      ],
    }

    const infoUrl = new URL("https://api.bilibili.com/x/web-interface/view")
    infoUrl.searchParams.set("bvid", videoId)

    const infoResponse = await fetch(infoUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
        Referer: "https://www.bilibili.com/",
      },
    })

    if (!infoResponse.ok) {
      return {
        ...errorResponse,
        statusCode: BILIBILI_ERROR_CODES.REQUEST_ERROR,
      }
    }

    const infoData =
      (await infoResponse.json()) as BilibiliApiResponse<BilibiliVideoData>

    if (infoData.code !== BILIBILI_ERROR_CODES.SUCCESS || !infoData.data) {
      const errorCodes: number[] = [
        BILIBILI_ERROR_CODES.REQUEST_ERROR,
        BILIBILI_ERROR_CODES.PERMISSION_DENIED,
        BILIBILI_ERROR_CODES.NOT_FOUND,
        BILIBILI_ERROR_CODES.VIDEO_INVISIBLE,
        BILIBILI_ERROR_CODES.VIDEO_UNDER_REVIEW,
        BILIBILI_ERROR_CODES.VIDEO_PRIVATE,
      ]

      return {
        ...errorResponse,
        statusCode: errorCodes.includes(infoData.code)
          ? infoData.code
          : BILIBILI_ERROR_CODES.UNKNOWN_ERROR,
      }
    }

    const { data } = infoData

    return {
      bvid: videoId,
      title: data.title,
      author: data.owner.name,
      authorImg: data.owner.face,
      duration: data.duration,
      cover: data.pic,
      uploadTime: timestampToDate(data.pubdate),
      description: data.desc,
      statusCode: BILIBILI_ERROR_CODES.SUCCESS,
      parts: data.pages.map((page) => ({
        cid: page.cid,
        partTitle: page.part,
        duration: page.duration,
        pageIndex: page.page,
      })),
    } as BilibiliVideo
  } catch (error) {
    console.error("❌ Error in search:", error)
    return null
  }
}
