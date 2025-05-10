// src/core/extractor/BambooExtractor.ts
import {
  BaseExtractor,
  type ExtractorInfo,
  type ExtractorSearchContext,
  type GuildQueueHistory,
  Playlist, // 如果在构建 Playlist 对象时需要
  QueryType,
  type SearchQueryType,
  Track,
} from "discord-player";
// SongDetail 来自 NeteaseCloudMusicApi，用于 buildNeteaseTrack
import type { SongDetail } from "NeteaseCloudMusicApi";

import {
  type ApiServiceType, // 如果在 activate 方法的选项中用到
  EXTRACTOR_IDENTIFIER,
  ExtractorSearchType, // 搜索类型枚举
} from "@/common/constants";
import type { ExtractorSearchOptions } from "@/common/types"; // 自定义搜索选项类型
import { millisecondsToTimeString } from "@/common/utils/common"; // 时间格式化工具
import { BambooApi } from "@/core/api/BambooApi"; // 你的API封装层
import type {
  NeteaseAlbumDetailed,
  NeteasePlaylistSearchResult,
  NeteasePlaylistTracks,
  NeteaseSong, // 网易云歌曲对象类型
  NeteaseUserProfile,
} from "@/core/api/interfaces"; // 你的接口定义

export class BambooExtractor extends BaseExtractor {
  static override identifier = EXTRACTOR_IDENTIFIER; // 提取器的唯一标识符

  private api: BambooApi | null = null; // API实例

  // 辅助函数：判断查询是否是直接的URL
  private isDirectUrl(query: string): boolean {
    return /^(?:https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(query);
  }

  // 辅助函数：判断查询是否是纯数字ID
  private isNumericId(query: string): boolean {
    return /^\d+$/.test(query);
  }

  // discord-player 用于桥接查询的方法，通常返回音轨的唯一标识 (如ID或URL)
  public override createBridgeQuery = (track: Track): string => {
    return track.url; // 假设 track.url 存储的是歌曲ID或可用于重新获取的标识
  };

  // 提取器激活时调用
  override async activate(): Promise<void> {
    // 从选项中获取 cookies (通过 player.extractors.register 传递)
    const initOptions = this.options as {
      cookies?: Record<ApiServiceType, string>;
    };
    const cookies = initOptions?.cookies;
    this.api = new BambooApi(cookies); // 初始化 BambooApi 实例

    this.protocols = ["bamboo"]; // (如果适用) 定义此提取器处理的协议名称
    await Promise.resolve(); // 表示异步操作完成
  }

  // 提取器停用时调用
  override async deactivate(): Promise<void> {
    this.api = null; // 清理 API 实例
    this.protocols = [];
    await Promise.resolve();
  }

  // 验证给定的查询是否应由此提取器处理
  override validate(
    query: string,
    queryType?: SearchQueryType,
  ): Promise<boolean> {
    if (typeof query !== "string") return Promise.resolve(false); // 只处理字符串查询

    // 如果查询不是一个直接的URL，并且 (是数字ID 或 queryType 是AUTO/AUTO_SEARCH/显式指定此提取器)
    // 则认为此提取器可以处理该查询
    return Promise.resolve(
      !this.isDirectUrl(query) &&
        (this.isNumericId(query) ||
          (
            [
              QueryType.AUTO,
              QueryType.AUTO_SEARCH,
              `ext:${EXTRACTOR_IDENTIFIER}`,
            ] as SearchQueryType[]
          ).includes(queryType!)),
    );
  }

  // 核心处理方法：根据查询获取音轨信息
  override async handle(
    query: string,
    context: ExtractorSearchContext, // 包含请求者等上下文信息
  ): Promise<ExtractorInfo> { // 必须返回 ExtractorInfo ({ playlist: Playlist | null, tracks: Track[] })
    if (!this.api) {
      // 如果API未初始化，这是个严重错误
      throw new Error("BambooExtractor is not activated: API instance is missing.");
    }

    // 获取自定义的请求选项 (如果通过 player.search 的 options 传递了)
    const requestOptions = context.requestOptions as
      | ExtractorSearchOptions // 你的自定义选项类型
      | undefined;

    // 根据 searchType 执行不同的逻辑
    switch (requestOptions?.searchType) {
      case ExtractorSearchType.AlbumLists: { // 搜索专辑列表 (用于 /album 命令选择)
        const rawAlbums = await this.api.searchAlbum(query);
        if (!rawAlbums || rawAlbums.length === 0) { // API未返回结果或结果为空
          // throw new Error(`No album lists found for query: ${query}`); // 或者返回空结果
          return { playlist: null, tracks: [] };
        }
        // 将原始专辑数据转换为 Track 对象列表 (每个 "Track" 代表一个可选择的专辑)
        const albumListTracks = this.buildAlbumSelectionItem(rawAlbums);
        return { playlist: null, tracks: albumListTracks }; // 返回专辑选择列表
      }
      case ExtractorSearchType.Album: { // 获取特定专辑内的所有歌曲 (用于 /album 命令选择后)
        const rawAlbumSongs = await this.api.getAlbumById(query); // query 此时是专辑ID
        if (!rawAlbumSongs || rawAlbumSongs.length === 0) {
          // throw new Error(`Failed to get songs for album ID: ${query} or album is empty.`);
          return { playlist: null, tracks: [] };
        }
        // 将专辑中的每首歌曲数据转换为 Track 对象
        const albumTracks = rawAlbumSongs.map((song) =>
          this.buildTrack(song, context),
        );
        // 创建一个 Playlist 对象来代表这个专辑
        const albumPlaylist = new Playlist(this.context.player, {
          tracks: albumTracks,
          title: rawAlbumSongs[0].al.name, // 使用第一首歌的专辑名作为播放列表标题
          description: rawAlbumSongs[0].al.description || "", // 专辑描述
          thumbnail: rawAlbumSongs[0].al.picUrl, // 专辑封面
          source: "arbitrary", // 表示来源是自定义的
          type: "album",
          author: { // 专辑的作者信息
            name: rawAlbumSongs[0].ar.map(a => a.name).join('/'), // 专辑艺术家
            url: "", // 可选：专辑相关的链接
          },
          id: query, // 专辑ID
          url: "", // 可选：专辑的URL
        });
        return { playlist: albumPlaylist, tracks: albumTracks }; // 返回播放列表及其音轨
      }
      // ... (其他 case: Lyric, UserLists, UserPlaylists, UserPlaylistTracks 保持不变) ...
      case ExtractorSearchType.Lyric: {
        const rawLyric = await this.api.getLyricById(query);
        if (!rawLyric) return { playlist: null, tracks: [] }; // throw new Error("Failed to get lyric from API");
        const lyricTrack = this.buildLyricTrack(rawLyric, context);
        return { playlist: null, tracks: [lyricTrack] };
      }
      case ExtractorSearchType.UserLists: {
        const rawUsers = await this.api.searchUser(query);
        if (!rawUsers) return { playlist: null, tracks: [] };// throw new Error("Failed to get user list from API");
        const userTracks = rawUsers.map((user) =>
          this.buildUserTrack(user, context),
        );
        return { playlist: null, tracks: userTracks };
      }
      case ExtractorSearchType.UserPlaylists: {
        const rawUserPlaylists = await this.api.getUserPlaylists(query);
        if (!rawUserPlaylists) return { playlist: null, tracks: [] }; // throw new Error("Failed to get user playlists from API");
        const userPlaylistTracks = rawUserPlaylists.map((playlist) =>
          this.buildPlaylistTrack(playlist, context),
        );
        return { playlist: null, tracks: userPlaylistTracks };
      }
      case ExtractorSearchType.UserPlaylistTracks: {
        const rawPlaylistData = await this.api.getUserPlaylistTracksById(query);
        if (!rawPlaylistData) return { playlist: null, tracks: [] }; // throw new Error("Failed to get playlist tracks from API");

        const playlistInfo = rawPlaylistData.info;
        const playlistTracks = rawPlaylistData.tracks.map((track) =>
          this.buildNeteaseTrack(track, context), // 使用 buildNeteaseTrack，因 tracks 是 SongDetail[]
        );

        const playlist = new Playlist(this.context.player, {
          tracks: playlistTracks,
          title: playlistInfo.name,
          description: playlistInfo.description || "",
          thumbnail: playlistInfo.coverImgUrl,
          type: "playlist",
          source: "arbitrary",
          author: {
            name: playlistInfo.creator.nickname,
            url: playlistInfo.creator.avatarUrl,
          },
          id: playlistInfo.id.toString(),
          url: "",
        });
        return { playlist: playlist, tracks: playlistTracks };
      }


      // ----- 修改的核心部分: 处理通用歌曲搜索，用于 /play 命令 -----
      case ExtractorSearchType.Track: // 如果 player.search 明确指定了此类型
      default: { // 或者当未指定 searchType 时 (例如，用户直接输入歌曲名)
        // 调用已修改的 getDefaultTrack，它现在返回 Promise<NeteaseSong[]>
        const rawTracksList = await this.api.getDefaultTrack(query);

        // 如果API调用返回空数组 (表示未找到歌曲或发生错误)
        // 则返回一个空的 ExtractorInfo 对象，discord-player 会将其视作 "未找到结果"
        if (!rawTracksList || rawTracksList.length === 0) {
          // console.debug(`BambooExtractor: No tracks found for query "${query}"`);
          return { playlist: null, tracks: [] };
        }

        // 将从API获取的 NeteaseSong 对象列表，映射为 discord-player 的 Track 对象列表
        const tracks = rawTracksList.map(songInfo =>
          this.buildTrack(songInfo, context), // 使用已有的 buildTrack 方法转换每个 NeteaseSong
        );

        // 返回包含多个 Track 对象的 ExtractorInfo，playlist 部分为 null
        return { playlist: null, tracks: tracks };
      }
    }
  }

  // 获取音轨的实际播放流 URL
  override async stream(track: Track): Promise<string> {
    if (!this.api) throw new Error("BambooExtractor is not activated (cannot stream).");
    // track.url 在 buildTrack 中被设置为歌曲ID
    const streamUrl = await this.api.getTrackUrl(track);
    if (!streamUrl) {
      throw new Error(`Failed to get stream URL for track: ${track.title} (ID: ${track.url})`);
    }
    return streamUrl;
  }

  // (可选) 获取相关音轨，用于 discord-player 的自动播放功能
  override async getRelatedTracks(
    track: Track, // 当前播放结束的音轨
    history: GuildQueueHistory, // 播放历史，用于避免重复推荐
  ): Promise<ExtractorInfo> {
    if (!this.api) throw new Error("BambooExtractor is not activated (cannot get related tracks).");

    const prevTrackIds = history.tracks.data.map((t) => t.url); // 假设 track.url 是歌曲ID
    const rawSimilarTrack = await this.api.getSimilarTrack(track.url, prevTrackIds);

    if (!rawSimilarTrack) { // 未找到相似歌曲
      return { playlist: null, tracks: [] };
    }

    // 构建相似歌曲的 Track 对象
    const relatedTrack = this.buildTrack(rawSimilarTrack); // 注意：getSimilarTrack 返回单个 NeteaseSong
    return { playlist: null, tracks: [relatedTrack] };
  }

  // --- 构建 Track 对象的辅助方法 ---

  /**
   * 从 NeteaseSong (网易云歌曲API对象) 构建 discord-player 的 Track 对象。
   * @param info 从API获取的 NeteaseSong 对象。
   * @param context 可选的搜索上下文，用于填充 requestedBy 等信息。
   * @returns 构建好的 Track 对象。
   */
  buildTrack(info: NeteaseSong, context?: ExtractorSearchContext): Track {
    return new Track(this.context.player, {
      title: info.name, // 歌曲标题
      description: info.al.name, // 使用专辑名作为描述，如果需要其他信息可以调整
      author: info.ar && info.ar.length > 0 ? info.ar.map(a => a.name).join('/') : '未知歌手', // 歌手名，处理多歌手情况
      url: `${info.id}`, // 将歌曲ID作为Track的URL，stream方法会用它来获取真实播放链接
      thumbnail: info.al.picUrl, // 专辑封面图片URL
      duration: millisecondsToTimeString(info.dt), // 歌曲时长 (格式化为 mm:ss 或 hh:mm:ss)
      views: 0, // 网易云标准API通常不直接返回播放量，可默认为0或后续通过其他方式获取
      requestedBy: context?.requestedBy, // 点歌用户 (从搜索上下文中获取)
      playlist: context?.playlist, // 如果此音轨是在某个播放列表的上下文中被获取的
      source: "arbitrary", // 表明音轨来源是自定义提取器
      engine: this, // 将此提取器实例关联到Track，discord-player内部可能使用
      queryType: context?.type ?? QueryType.AUTO, // 保留原始查询类型或设为自动
      metadata: info, // 将原始的 NeteaseSong 对象存储在 Track 的 metadata 中，方便后续访问
      requestMetadata: async () => info, // 用于 discord-player 按需重新获取元数据
    });
  }

  /**
   * 从网易云的 SongDetail 对象 (通常来自歌单详情接口) 构建 Track 对象。
   * SongDetail 可能比常规搜索结果中的 NeteaseSong 更详细。
   * @param song 从API获取的 SongDetail 对象。
   * @param context 搜索上下文。
   * @returns 构建好的 Track 对象。
   */
  buildNeteaseTrack(song: SongDetail, context: ExtractorSearchContext): Track {
    return new Track(this.context.player, {
      title: song.name,
      author: song.ar && song.ar.length > 0 ? song.ar.map(a => a.name).join('/') : '未知歌手',
      url: `${song.id}`,
      thumbnail: song.al.picUrl,
      duration: millisecondsToTimeString(song.dt),
      requestedBy: context.requestedBy,
      playlist: context.playlist,
      source: "arbitrary",
      engine: this,
      queryType: context.type ?? QueryType.AUTO, // 使用 context 中的 type
      metadata: song, // 存储原始 SongDetail
      requestMetadata: async () => song,
    });
  }

  /**
   * 为专辑选择列表构建特殊的 "Track" 对象 (每个对象代表一个可选择的专辑)。
   * @param albumList 从API获取的专辑详细信息列表。
   * @returns 代表专辑的 Track 对象数组。
   */
  buildAlbumSelectionItem(albumList: NeteaseAlbumDetailed[]): Track[] {
    return albumList.map((album) => {
      return new Track(this.context.player, {
        title: album.name, // 专辑名作为标题
        url: `${album.id}`, // 专辑ID作为URL，用于后续获取专辑内歌曲
        author: album.artists && album.artists.length > 0 ? album.artists.map(a => a.name).join('/') : '未知艺术家',
        duration: `${album.publishTime}`, // 将发布时间戳作为 "时长" (用于显示或排序)
        thumbnail: album.picUrl, // 专辑封面
        views: album.size, // 专辑内歌曲数量，可用作 "播放量" 或类似指标
        source: "arbitrary",
        engine: this,
        metadata: album, // 存储原始专辑信息
      });
    });
  }

  /**
   * 构建用于承载歌词信息的特殊 Track 对象。
   * @param lyric 歌词字符串。
   * @param context 搜索上下文。
   * @returns 代表歌词的 Track 对象。
   */
  buildLyricTrack(lyric: string, context: ExtractorSearchContext): Track {
    return new Track(this.context.player, {
      title: "歌曲歌词", // 可以考虑从 context 或其他地方获取关联的歌曲名
      description: lyric.substring(0, 100) + (lyric.length > 100 ? "..." : ""), // 歌词预览
      author: "歌词信息",
      url: `internal_lyric_${context.id || Date.now()}`, // 构造一个唯一的内部URL
      duration: "0:00", // 歌词本身没有播放时长
      requestedBy: context.requestedBy,
      source: "arbitrary",
      engine: this,
      queryType: context.type ?? QueryType.AUTO,
      metadata: { lyricContent: lyric }, // 将完整歌词存储在 metadata 中
    });
  }

  /**
   * 为用户搜索结果构建特殊的 "Track" 对象 (每个对象代表一个可选择的用户)。
   * @param user 从API获取的用户信息对象。
   * @param context 搜索上下文。
   * @returns 代表用户的 Track 对象。
   */
  buildUserTrack(
    user: NeteaseUserProfile,
    context: ExtractorSearchContext,
  ): Track {
    return new Track(this.context.player, {
      title: user.nickname, // 用户昵称作为标题
      url: `${user.userId}`, // 用户ID作为URL
      author: "用户", // 类型标识
      duration: "N/A", // 无时长
      thumbnail: user.avatarUrl, // 用户头像作为缩略图
      requestedBy: context.requestedBy,
      source: "arbitrary",
      engine: this,
      queryType: context.type ?? QueryType.AUTO,
      metadata: user, // 存储原始用户信息
    });
  }

  /**
   * 为歌单搜索结果构建特殊的 "Track" 对象 (每个对象代表一个可选择的歌单)。
   * @param playlist 从API获取的歌单搜索结果项。
   * @param context 搜索上下文。
   * @returns 代表歌单的 Track 对象。
   */
  buildPlaylistTrack(
    playlist: NeteasePlaylistSearchResult, // 注意这里用的是 NeteasePlaylistSearchResult
    context: ExtractorSearchContext,
  ): Track {
    return new Track(this.context.player, {
      title: playlist.name, // 歌单名作为标题
      url: `${playlist.id}`, // 歌单ID作为URL
      author: `包含 ${playlist.trackCount} 首歌曲`, // 描述信息，如歌曲数量
      duration: "N/A", // 无时长
      thumbnail: playlist.coverImgUrl, // 歌单封面
      requestedBy: context.requestedBy,
      source: "arbitrary",
      engine: this,
      queryType: context.type ?? QueryType.AUTO,
      metadata: playlist, // 存储原始歌单搜索结果项信息
    });
  }
}
