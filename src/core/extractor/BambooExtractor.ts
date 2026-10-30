import {
  BaseExtractor,
  type ExtractorInfo,
  type ExtractorSearchContext,
  type GuildQueueHistory,
  Playlist,
  QueryType,
  Track,
} from "discord-player"
import { match, P } from "ts-pattern"

import { recordFailure } from "@/common/context"
import { BambooError } from "@/common/errors"
import { isLink, millisecondsToTimeString } from "@/common/utils/common"
import { logger } from "@/common/utils/logger"
import {
  getAlbumWithSongs,
  getPlaylistWithSongs,
  getSimilarSongs,
  getSongUrl,
  idFromLink,
  searchSongs,
} from "@/core/api/services/netease/api"
import {
  ALBUM_LINK,
  EXTRACTOR_IDENTIFIER,
  NETEASE_LINKS,
  PLAYLIST_LINK,
  SONG_LINK,
} from "@/core/api/services/netease/constants"
import type { NeteaseSong } from "@/core/api/services/netease/types"

export class NeteaseExtractor extends BaseExtractor {
  static override identifier = EXTRACTOR_IDENTIFIER

  public override createBridgeQuery = (track: Track) => track.url

  override activate(): Promise<void> {
    this.protocols = ["bamboo"]
    return Promise.resolve()
  }

  override deactivate(): Promise<void> {
    this.protocols = []
    return Promise.resolve()
  }

  override validate(query: string): Promise<boolean> {
    return Promise.resolve(
      NETEASE_LINKS.some((link) => query.startsWith(link)) || !isLink(query),
    )
  }

  override async handle(
    query: string,
    context: ExtractorSearchContext,
  ): Promise<ExtractorInfo> {
    try {
      return await match(query)
        .with(P.string.startsWith(ALBUM_LINK), (link) =>
          this.album(link, context),
        )
        .with(P.string.startsWith(PLAYLIST_LINK), (link) =>
          this.playlist(link, context),
        )
        .otherwise((text) => this.firstHit(text, context))
    } catch (error) {
      if (error instanceof BambooError) recordFailure(error)
      else logger.error(`Lookup failed for ${query}`, error)
      return this.createResponse()
    }
  }

  override async stream(track: Track): Promise<string> {
    return getSongUrl(idFromLink(track.url))
  }

  // discord-player calls this method when it wants some tracks for autoplay mode.
  override async getRelatedTracks(
    track: Track,
    history: GuildQueueHistory,
  ): Promise<ExtractorInfo> {
    const played = new Set(history.tracks.data.map(({ url }) => url))
    const candidates = this.toTracks(
      await getSimilarSongs(idFromLink(track.url)),
    )
    const related =
      candidates.find(({ url }) => !played.has(url)) ?? candidates.at(0)
    return this.createResponse(null, related ? [related] : [])
  }

  private async firstHit(
    text: string,
    context: ExtractorSearchContext,
  ): Promise<ExtractorInfo> {
    const [track] = this.toTracks(await searchSongs(text), context)
    return this.createResponse(null, track ? [track] : [])
  }

  private async album(
    link: string,
    context: ExtractorSearchContext,
  ): Promise<ExtractorInfo> {
    const { album, songs } = await getAlbumWithSongs(idFromLink(link))
    const tracks = this.toTracks(songs, context, album.picUrl)
    return this.createResponse(
      new Playlist(this.context.player, {
        tracks,
        title: album.name,
        description: album.description ?? "",
        thumbnail: album.picUrl,
        source: "arbitrary",
        type: "album",
        author: {
          name: tracks.at(0)?.author ?? album.artists[0].name,
          url: `${album.publishTime}`,
        },
        id: String(album.id),
        url: `${ALBUM_LINK}${album.id}`,
      }),
      tracks,
    )
  }

  private async playlist(
    link: string,
    context: ExtractorSearchContext,
  ): Promise<ExtractorInfo> {
    const { playlist, songs } = await getPlaylistWithSongs(idFromLink(link))
    const tracks = this.toTracks(songs, context)
    return this.createResponse(
      new Playlist(this.context.player, {
        tracks,
        title: playlist.name,
        description: playlist.description ?? "",
        thumbnail: playlist.coverImgUrl,
        type: "playlist",
        source: "arbitrary",
        author: {
          name: playlist.creator?.nickname ?? "",
          url: playlist.creator?.avatarUrl ?? "",
        },
        id: String(playlist.id),
        url: `${PLAYLIST_LINK}${playlist.id}`,
      }),
      tracks,
    )
  }

  private toTracks(
    songs: NeteaseSong[],
    context?: ExtractorSearchContext,
    thumbnail?: string,
  ): Track[] {
    return songs.flatMap((song) => {
      const artist = song.ar?.[0]
      if (!artist || !song.al) {
        logger.warn(
          `Skipped NetEase song ${song.id} without an artist or album`,
        )
        return []
      }
      return new Track(this.context.player, {
        title: song.name,
        url: `${SONG_LINK}${song.id}`,
        duration: millisecondsToTimeString(song.dt),
        thumbnail: thumbnail ?? song.al.picUrl,
        author: artist.name,
        requestedBy: context?.requestedBy,
        source: "arbitrary",
        queryType: context?.type ?? QueryType.AUTO,
        metadata: song,
        requestMetadata: () => Promise.resolve(song),
      })
    })
  }
}
