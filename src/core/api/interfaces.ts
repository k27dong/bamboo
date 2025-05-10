// src/core/api/interfaces.ts
import type { Track } from "discord-player";
import type { SongDetail } from "NeteaseCloudMusicApi"; // NeteaseCloudMusicApi 包导出的类型

// --- 你的 Bamboo 音乐 API 接口定义 ---
export interface BambooMusicApi {
  getTrackUrl: (track: Track) => Promise<string>; // 参数 track 应为 Track 类型，与实现一致
  // 修改点: getDefaultTrack 的返回类型，现在它应该返回一个歌曲数组
  getDefaultTrack: (query: string) => Promise<NeteaseSong[]>; // 原为 Promise<NeteaseSong | null>

  searchAlbum: (query: string) => Promise<NeteaseAlbumDetailed[] | null>;
  getAlbumById: (id: string) => Promise<NeteaseSong[] | null>;
  getLyricById: (id: string) => Promise<string | null>;
  searchUser: (query: string) => Promise<NeteaseUserProfile[] | null>;
  getUserPlaylists: (
    query: string,
  ) => Promise<NeteasePlaylistSearchResult[] | null>;
  getUserPlaylistTracksById: (
    id: string,
  ) => Promise<NeteasePlaylistTracks | null>;
  getSimilarTrack: (
    id: string,
    prevTracks: string[],
  ) => Promise<NeteaseSong | null>;
}

// --- 网易云 API 返回数据结构相关的接口 (根据你之前提供的填写) ---
export interface NeteaseCloudSearchSongResult {
  searchQcReminder: any; // 未知类型，保持any或根据实际情况定义
  songs: NeteaseSong[];   // 歌曲列表
  songCount: number;      // 歌曲总数
}

export enum NeteaseFeeType { // 歌曲付费类型枚举
  FREE_OR_NONE = 0,
  VIP = 1,
  PREMIUM_ALBUM = 3, // 通常是数字专辑购买
  LOW_QUALITY = 8,   // 可能是指只能听低音质的付费曲目
}

export interface NeteaseAlbum { // 专辑基本信息
  id: number;
  name: string;
  picUrl: string;        // 专辑封面图片URL
  description: string;   // 专辑描述 (在你的 NeteaseSong.al 中这个字段可能不存在或为空)
}

export interface NeteaseAlbumDetailed extends NeteaseAlbum { // 专辑详细信息
  size: number;          // 专辑内歌曲数量
  pic: number;           // 未知用途，可能是图片相关的ID
  publishTime: number;   // 发布时间戳
  artists: NeteaseArtist[]; // 专辑艺术家列表
}

export interface NeteaseArtist { // 歌手基本信息
  id: number;
  name: string;
}

export interface NeteaseSong { // 歌曲详细信息
  name: string;          // 歌曲名
  id: number;            // 歌曲ID
  ar: NeteaseArtist[];   // 歌手列表
  pop: number;           // 热度 (popularity)
  fee: NeteaseFeeType;   // 付费类型
  al: NeteaseAlbum;      // 所属专辑信息
  dt: number;            // 歌曲时长 (毫秒)
  publishTime: number;   // 发布时间戳 (此字段在原始API的歌曲对象中可能不直接提供，更多是在专辑信息中)
  s_id: number;          // 用于指示歌曲是否来自云盘 (具体含义需查API文档)
}

export interface NeteaseSongPlayable { // 歌曲可播放信息 (通常来自 /song/url 接口)
  id: number;
  url: string;           // 播放URL
  size: number;          // 文件大小
  code: number;          // API状态码
  type: string;          // 音频文件类型 (e.g., "mp3")
  fee: NeteaseFeeType;   // 付费信息
}

export interface NeteaseCloudSearchAlbumResult { // 专辑搜索结果
  albums: NeteaseAlbumDetailed[];
  albumCount: number;
}

// (NeteaseAlbumSearchInfo 接口似乎未使用，如果需要请保留)
// export interface NeteaseAlbumSearchInfo {
//   picUrl: string;
//   description: string;
//   publishTime: number;
// }

export interface NeteaseLyric { // 歌词信息
  version: number;
  lyric: string;
}

export interface NeteaseUserProfile { // 用户基本信息
  defaultAvatar: boolean;
  avatarUrl: string;
  userId: number;
  nickname: string;
  signature: string;
  playlistCount: number;
}

export interface NeteaseCloudSearchUserResult { // 用户搜索结果
  userprofiles: NeteaseUserProfile[];
  userprofileCount: number;
}

export interface NeteasePlaylistSearchResult { // 歌单搜索结果 (通常是歌单列表项)
  trackCount: number;    // 歌单内歌曲数量
  coverImgUrl: string;   // 歌单封面
  playCount: number;     // 播放次数
  name: string;          // 歌单名
  id: number;            // 歌单ID
}

export interface NeteasePlaylistDetailSearchResult { // 歌单详情 (通常是获取单个歌单信息的结果)
  id: number;
  name: string;
  coverImgUrl: string;
  userId: number;        // 创建者用户ID
  createTime: number;    // 创建时间戳
  playCount: number;
  description: string;
  trackIds: any[];       // 可能是 {id: number}[] 结构，表示歌单内歌曲ID列表
  creator: NeteaseUserProfile; // 创建者信息
}

export interface NeteasePlaylistTracks { // 包含歌单信息及其所有音轨的结构
  info: NeteasePlaylistDetailSearchResult; // 歌单的详细信息
  tracks: SongDetail[]; // 歌单内的歌曲列表 (SongDetail 是 NeteaseCloudMusicApi 包的类型)
}

// (NeteaseSimilarTrack 接口似乎未使用，如果需要请保留)
// export interface NeteaseSimilarTrack {
//   fee: NeteaseFeeType;
//   popularity: number;
//   id: number;
//   name: string;
//   artists: NeteaseArtist[];
//   album: NeteaseAlbum;
//   duration: number;
//   publishTime: number;
// }
