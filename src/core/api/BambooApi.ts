// src/core/api/BambooApi.ts
import type { Track } from "discord-player";

import { ApiServiceType } from "@/common/constants"; // API服务类型枚举
import type {
  BambooMusicApi, // 导入修改后的接口
  NeteaseAlbumDetailed,
  NeteasePlaylistSearchResult,
  NeteasePlaylistTracks,
  NeteaseSong, // 确保 NeteaseSong 类型已导入
  NeteaseUserProfile,
} from "@/core/api/interfaces";

import { NeteaseService } from "./services/netease"; // 确保路径正确

export class BambooApi implements BambooMusicApi {
  private services: Record<ApiServiceType, BambooMusicApi>;

  constructor(cookies?: Record<ApiServiceType, string>) {
    this.services = {
      // 目前只支持网易云服务
      [ApiServiceType.Netease]: new NeteaseService(
        cookies?.[ApiServiceType.Netease],
      ),
    };
  }

  // 根据服务类型获取对应的服务实例
  private getService(source: ApiServiceType): BambooMusicApi {
    const service = this.services[source];
    if (!service) {
      throw new Error(`Unsupported music source: ${source}`);
    }
    return service;
  }

  async getTrackUrl(
    track: Track, // 参数 track
    source: ApiServiceType = ApiServiceType.Netease,
  ): Promise<string> {
    const service = this.getService(source);
    return service.getTrackUrl(track);
  }

  /**
   * 根据查询字符串搜索歌曲列表。
   * 此方法委托给相应的服务 (如 NeteaseService)，该服务现在返回歌曲数组。
   * @param query 搜索查询字符串。
   * @param source API服务类型，默认为网易云。
   * @returns 返回一个 NeteaseSong 对象数组。
   */
  async getDefaultTrack(
    query: string,
    source: ApiServiceType = ApiServiceType.Netease,
  ): Promise<NeteaseSong[]> { // 修改点: 返回类型与 BambooMusicApi 接口一致
    const service = this.getService(source);
    // service.getDefaultTrack 现在应该返回 Promise<NeteaseSong[]>
    return await service.getDefaultTrack(query);
  }

  async searchAlbum(
    query: string,
    source: ApiServiceType = ApiServiceType.Netease,
  ): Promise<NeteaseAlbumDetailed[] | null> {
    const service = this.getService(source);
    return await service.searchAlbum(query);
  }

  async getAlbumById(
    id: string,
    source: ApiServiceType = ApiServiceType.Netease,
  ): Promise<NeteaseSong[] | null> {
    const service = this.getService(source);
    return await service.getAlbumById(id);
  }

  async getLyricById(
    id: string,
    source: ApiServiceType = ApiServiceType.Netease,
  ): Promise<string | null> {
    const service = this.getService(source);
    return await service.getLyricById(id);
  }

  async searchUser(
    query: string,
    source: ApiServiceType = ApiServiceType.Netease,
  ): Promise<NeteaseUserProfile[] | null> {
    const service = this.getService(source);
    return await service.searchUser(query);
  }

  async getUserPlaylists(
    query: string,
    source: ApiServiceType = ApiServiceType.Netease,
  ): Promise<NeteasePlaylistSearchResult[] | null> {
    const service = this.getService(source);
    return await service.getUserPlaylists(query);
  }

  async getUserPlaylistTracksById(
    id: string,
    source: ApiServiceType = ApiServiceType.Netease,
  ): Promise<NeteasePlaylistTracks | null> {
    const service = this.getService(source);
    return await service.getUserPlaylistTracksById(id);
  }

  async getSimilarTrack(
    id: string,
    prevTracks: string[],
    source: ApiServiceType = ApiServiceType.Netease,
  ): Promise<NeteaseSong | null> {
    const service = this.getService(source);
    return await service.getSimilarTrack(id, prevTracks);
  }
}
