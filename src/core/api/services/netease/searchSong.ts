// src/core/api/services/netease/searchSong.ts
import NeteaseCloudMusicApi, { type SearchType } from "NeteaseCloudMusicApi";

import { REAL_IP } from "@/common/utils/config"; // 确保这个路径和配置是正确的
import type {
  NeteaseCloudSearchSongResult,
  NeteaseSong,
} from "@/core/api/interfaces";

/**
 * 根据关键词搜索歌曲列表
 * @param query 搜索关键词
 * @param cookie 可选的cookie字符串
 * @returns 返回 NeteaseSong 数组，如果出错或无结果则返回空数组
 */
export const searchSong = async (
  query: string,
  cookie?: string,
): Promise<NeteaseSong[]> => { // 返回类型修改为 Promise<NeteaseSong[]>
  try {
    const rawResult = await NeteaseCloudMusicApi.cloudsearch({
      keywords: query,
      type: 1 as SearchType, // type: 1 表示搜索单曲
      // limit: 10, // 你可以按需添加 limit 参数来控制返回数量，API默认可能返回30首
      cookie,
      realIP: REAL_IP, // 使用配置的 REAL_IP
    });
    // 类型断言确保 body 和 result 存在且符合预期结构
    const result = (rawResult?.body?.result as NeteaseCloudSearchSongResult) || { songs: [] };
    return result.songs || []; // 如果 songs 字段不存在或为 null/undefined，则返回空数组
  } catch (error) {
    console.error("❌ Netease API - Error in searchSong:", error);
    return []; // 出错时返回空数组，确保函数总能解析为一个数组
  }
};
