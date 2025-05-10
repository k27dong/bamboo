// src/core/api/services/netease/searchSong.ts
import NeteaseCloudMusicApi, { type SearchType } from "NeteaseCloudMusicApi";

import { REAL_IP } from "@/common/utils/config"; // 确保 REAL_IP 从你的配置中正确导入
import type {
  NeteaseCloudSearchSongResult, // 网易云搜索结果的歌曲部分类型
  NeteaseSong, // 网易云歌曲对象的类型
} from "@/core/api/interfaces";

/**
 * 根据关键词搜索歌曲列表。
 * @param query 搜索关键词。
 * @param cookie 可选的cookie字符串，用于需要登录的API操作。
 * @returns 返回一个 NeteaseSong 对象数组。如果发生错误或未找到歌曲，则返回空数组。
 */
export const searchSong = async (
  query: string,
  cookie?: string,
): Promise<NeteaseSong[]> => { // 修改点: 返回类型从 NeteaseSong | null 改为 NeteaseSong[]
  try {
    const rawResult = await NeteaseCloudMusicApi.cloudsearch({
      keywords: query,
      type: 1 as SearchType, // type: 1 指定搜索类型为单曲
      // limit: 10, // 你可以根据需要取消注释并设置一个 limit 来控制返回结果的数量
      cookie,
      realIP: REAL_IP, // 使用配置的 REAL_IP，可能用于绕过某些API限制
    });

    // 安全地访问嵌套属性，并确保即使 result 或 songs 为 null/undefined 也不会报错
    const result = (rawResult?.body?.result as NeteaseCloudSearchSongResult) || { songs: [] };

    // 修改点: 返回整个 songs 数组，如果 songs 不存在或为 null，则返回空数组
    return result.songs || [];
  } catch (error) {
    // 捕获API调用或处理过程中的任何错误
    console.error("❌ Netease API - Error in searchSong (fetching song list):", error);
    return []; // 发生错误时返回空数组，确保函数总能resolve为一个数组
  }
};
