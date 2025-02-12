import {
  BaseExtractor,
  type ExtractorInfo,
  type ExtractorSearchContext,
  Playlist,
  QueryType,
  type SearchQueryType,
  Track,
} from "discord-player"
import type { SongDetail } from "NeteaseCloudMusicApi"

import {
  type ApiServiceType,
  EXTRACTOR_IDENTIFIER,
  ExtractorSearchType,
} from "@/common/constants"
import type { ExtractorSearchOptions } from "@/common/types"
import { millisecondsToTimeString } from "@/common/utils/common"
import { BambooApi } from "@/core/api/BambooApi"
import type {
  NeteaseAlbumDetailed,
  NeteasePlaylistSearchResult,
  NeteaseSong,
  NeteaseUserProfile,
} from "@/core/api/interfaces"

export class BambooExtractor extends BaseExtractor {
  static override identifier = EXTRACTOR_IDENTIFIER

  private api: BambooApi | null = null

  private isDirectUrl(query: string): boolean {
    return /^(?:https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(query)
  }

  private isNumericId(query: string): boolean {
    return /^\d+$/.test(query)
  }

  public override createBridgeQuery = (track: Track) => {
    return track.url
  }

  override async activate(): Promise<void> {
    const initOptions = this.options as {
      cookies?: Record<ApiServiceType, string>
    }

    const cookies = initOptions?.cookies
    this.api = new BambooApi(cookies)

    this.protocols = ["bamboo"]
    await Promise.resolve()
  }

  override async deactivate(): Promise<void> {
    this.api = null
    this.protocols = []
    await Promise.resolve()
  }

  override validate(
    query: string,
    queryType?: SearchQueryType,
  ): Promise<boolean> {
    if (typeof query !== "string") return Promise.resolve(false)

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
    )
  }

  override async handle(
    query: string,
    context: ExtractorSearchContext,
  ): Promise<ExtractorInfo> {
    if (!this.api) throw new Error("Extractor not activated")

    const requestOptions = context.requestOptions as
      | ExtractorSearchOptions
      | undefined

    switch (requestOptions?.searchType) {
      case ExtractorSearchType.AlbumLists: {
        const rawAlbums = await this.api.searchAlbum(query)
        if (!rawAlbums) throw new Error("Failed to get album list")

        const albumList = this.buildAlbumSelectionItem(rawAlbums)

        return this.createResponse(null, albumList)
      }
      case ExtractorSearchType.Album: {
        const rawAlbumSongs = await this.api.getAlbumById(query)
        if (!rawAlbumSongs) throw new Error("Failed to get album")

        const albumSongs = rawAlbumSongs.map((song) =>
          this.buildTrack(song, context),
        )

        const album = new Playlist(this.context.player, {
          tracks: albumSongs,
          title: rawAlbumSongs[0].al.name,
          description: rawAlbumSongs[0].al.description,
          thumbnail: albumSongs[0].thumbnail,
          source: "arbitrary",
          type: "album",
          author: {
            name: albumSongs[0].author,
            url: rawAlbumSongs[0].publishTime.toString(),
          },
          id: query,
          url: "",
        })

        return this.createResponse(album, albumSongs)
      }
      case ExtractorSearchType.Lyric: {
        const rawLyric = await this.api.getLyricById(query)
        if (!rawLyric) throw new Error("Failed to get lyric")

        const lyricTrack = this.buildLyricTrack(rawLyric, context)

        return this.createResponse(null, [lyricTrack])
      }
      case ExtractorSearchType.UserLists: {
        const rawUsers = await this.api.searchUser(query)
        if (!rawUsers) throw new Error("Failed to get user list")

        const userTracks = rawUsers.map((user) =>
          this.buildUserTrack(user, context),
        )

        return this.createResponse(null, userTracks)
      }
      case ExtractorSearchType.UserPlaylists: {
        const rawUserPlaylists = await this.api.getUserPlaylists(query)
        if (!rawUserPlaylists) throw new Error("Failed to get user playlists")

        const userPlaylists = rawUserPlaylists.map((playlist) =>
          this.buildPlaylistTrack(playlist, context),
        )

        return this.createResponse(null, userPlaylists)
      }
      case ExtractorSearchType.UserPlaylistTracks: {
        const rawPlaylistTracks =
          await this.api.getUserPlaylistTracksById(query)
        if (!rawPlaylistTracks) throw new Error("Failed to get playlist")

        const playlistInfo = rawPlaylistTracks.info

        const playlistTracks = rawPlaylistTracks.tracks.map((track) =>
          this.buildNeteaseTrack(track, context),
        )

        const playlist = new Playlist(this.context.player, {
          tracks: playlistTracks,
          title: playlistInfo.name,
          description: playlistInfo.description,
          thumbnail: playlistInfo.coverImgUrl,
          type: "playlist",
          source: "arbitrary",
          author: {
            name: playlistInfo.creator.nickname,
            url: playlistInfo.creator.avatarUrl,
          },
          id: playlistInfo.id.toString(),
          url: "",
        })

        return this.createResponse(playlist, playlistTracks)
      }
      case ExtractorSearchType.Track:
      default: {
        const rawTrack = await this.api.getDefaultTrack(query)
        if (!rawTrack) throw new Error("Failed to get track")

        const track = this.buildTrack(rawTrack, context)

        return this.createResponse(null, [track])
      }
    }
  }

  override async stream(track: Track): Promise<string> {
    if (!this.api) throw new Error("Extractor not activated")

    const streamUrl = await this.api.getTrackUrl(track)
    if (!streamUrl) throw new Error("Failed to get stream URL")

    return streamUrl
  }

  // discord-player calls this method when it wants some tracks for autoplay mode.
  // override async getRelatedTracks(track): Promise<ExtractorInfo> {
  //   return this.createResponse(null, [tracks])
  // }

  buildTrack(info: NeteaseSong, context: ExtractorSearchContext): Track {
    return new Track(this.context.player, {
      title: info.name,
      url: `${info.id}`,
      duration: millisecondsToTimeString(info.dt),
      thumbnail: info.al.picUrl,
      author: info.ar[0].name,
      requestedBy: context.requestedBy,
      source: "arbitrary",
      queryType: context.type!,
      metadata: info,
      requestMetadata: () => Promise.resolve(info),
    })
  }

  buildNeteaseTrack(song: SongDetail, context: ExtractorSearchContext): Track {
    return new Track(this.context.player, {
      title: song.name,
      url: `${song.id}`,
      duration: millisecondsToTimeString(song.dt),
      thumbnail: song.al.picUrl,
      author: song.ar[0].name,
      requestedBy: context.requestedBy,
      source: "arbitrary",
      queryType: context.type!,
      metadata: song,
      requestMetadata: () => Promise.resolve(song),
    })
  }

  buildAlbumSelectionItem(albumList: NeteaseAlbumDetailed[]): Track[] {
    return albumList.map((album) => {
      return new Track(this.context.player, {
        title: album.name,
        url: `${album.id}`,
        duration: `${album.publishTime}`,
        author: album.artists[0].name,
        source: "arbitrary",
        views: album.size,
      })
    })
  }

  buildLyricTrack(lyric: string, context: ExtractorSearchContext): Track {
    return new Track(this.context.player, {
      title: lyric,
      requestedBy: context.requestedBy,
      source: "arbitrary",
      queryType: context.type!,
    })
  }

  buildUserTrack(
    user: NeteaseUserProfile,
    context: ExtractorSearchContext,
  ): Track {
    return new Track(this.context.player, {
      title: user.nickname,
      url: `${user.userId}`,
      requestedBy: context.requestedBy,
      source: "arbitrary",
      queryType: context.type!,
    })
  }

  buildPlaylistTrack(
    playlist: NeteasePlaylistSearchResult,
    context: ExtractorSearchContext,
  ): Track {
    return new Track(this.context.player, {
      title: playlist.name,
      url: `${playlist.id}`,
      thumbnail: playlist.coverImgUrl,
      author: playlist.trackCount.toString(),
      requestedBy: context.requestedBy,
      source: "arbitrary",
      queryType: context.type!,
    })
  }
}
