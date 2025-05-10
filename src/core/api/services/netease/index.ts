// src/core/api/services/netease/index.ts
import type { Track } from "discord-player";

import type {
  BambooMusicApi,
  NeteaseAlbumDetailed,
  NeteasePlaylistSearchResult,
  NeteasePlaylistTracks,
  NeteaseSong, // 确保 NeteaseSong 类型已导入
  NeteaseUserProfile,
} from "@/core/api/interfaces";

// 导入各个功能的实现模块
import { getAlbumList } from "./getAlbumList";
import { getAlbumSongs } from "./getAlbumSongs";
import { getPlaylistsByUserId } from "./getPlaylistsByUserId";
import { getPlaylistTracks } from "./getPlaylistTracks";
import { getRawLyricById } from "./getRawLyricById";
import { getSimilarTrackById } from "./getSimilarTrackById";
import { getSongUrlByTrack } from "./getTrackUrl";
import { searchSong } from "./searchSong"; // 导入已修改的 searchSong 函数
import { searchUser } from "./searchUser";

export class NeteaseService implements BambooMusicApi {
  private cookie?: string;

  constructor(cookie?: string) {
    this.cookie = cookie;
  }

  async getTrackUrl(track: Track): Promise<string> {
    return getSongUrlByTrack(track, this.cookie);
  }

  /**
   * 根据查询字符串搜索歌曲列表。
   * 此方法现在调用已修改的 searchSong，该函数返回一个歌曲数组。
   * @param query 搜索查询字符串。
   * @returns 返回一个 NeteaseSong 对象数组。
   */
  async getDefaultTrack(query: string): Promise<NeteaseSong[]> { // 修改点: 返回类型与 BambooMusicApi 接口一致
    return searchSong(query, this.cookie); // searchSong 现在返回 Promise<NeteaseSong[]>
  }

  async searchAlbum(query: string): Promise<NeteaseAlbumDetailed[] | null> {
    return getAlbumList(query, this.cookie);
  }

  async getAlbumById(id: string): Promise<NeteaseSong[] | null> {
    return getAlbumSongs(id, this.cookie);
  }

  async getLyricById(id: string): Promise<string | null> {
    return getRawLyricById(id, this.cookie);
  }

  async searchUser(query: string): Promise<NeteaseUserProfile[] | null> {
    return searchUser(query, this.cookie);
  }

  async getUserPlaylists(
    query: string,
  ): Promise<NeteasePlaylistSearchResult[] | null> {
    return getPlaylistsByUserId(query, this.cookie);
  }

  async getUserPlaylistTracksById(
    id: string,
  ): Promise<NeteasePlaylistTracks | null> {
    return getPlaylistTracks(id, this.cookie);
  }

  async getSimilarTrack(
    id: string,
    prev: string[], // 参数名 prev 与接口定义 prevTracks 可能需要统一
  ): Promise<NeteaseSong | null> {
    return getSimilarTrackById(id, prev, this.cookie);
  }
}
