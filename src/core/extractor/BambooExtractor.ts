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
import { millisecondsToTimeString } from "@/common/utils/common"
import { logger } from "@/common/utils/logger"
import { isLink, type Song } from "@/core/api/interfaces"
import {
  albumWithSongs,
  idFromLink,
  netease,
  playlistWithSongs,
} from "@/core/api/services/netease/api"
import {
  ALBUM_LINK,
  EXTRACTOR_IDENTIFIER,
  NETEASE_LINKS,
  PLAYLIST_LINK,
} from "@/core/api/services/netease/constants"

export const songFromTrack = (track: Track): Song => ({
  id: idFromLink(track.url),
  title: track.title,
  artist: track.author,
  durationMs: track.durationMS,
  thumbnail: track.thumbnail,
  url: track.url,
})

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
    return netease.getStreamUrl(songFromTrack(track))
  }

  // discord-player calls this method when it wants some tracks for autoplay mode.
  override async getRelatedTracks(
    track: Track,
    history: GuildQueueHistory,
  ): Promise<ExtractorInfo> {
    const related = await netease.findRelated(
      songFromTrack(track),
      history.tracks.data.map(songFromTrack),
    )
    return this.createResponse(null, related ? [this.trackOf(related)] : [])
  }

  private async firstHit(
    text: string,
    context: ExtractorSearchContext,
  ): Promise<ExtractorInfo> {
    const [song] = await netease.searchSongs(text)
    return this.createResponse(null, song ? [this.trackOf(song, context)] : [])
  }

  private async album(
    link: string,
    context: ExtractorSearchContext,
  ): Promise<ExtractorInfo> {
    const { album, songs } = await albumWithSongs(idFromLink(link))
    const tracks = songs.map((song) => this.trackOf(song, context))
    return this.createResponse(
      new Playlist(this.context.player, {
        tracks,
        title: album.title,
        description: album.description,
        thumbnail: album.thumbnail,
        source: "arbitrary",
        type: "album",
        author: {
          name: songs.at(0)?.artist ?? album.artist,
          url: `${album.publishedAt}`,
        },
        id: album.id,
        url: album.url,
      }),
      tracks,
    )
  }

  private async playlist(
    link: string,
    context: ExtractorSearchContext,
  ): Promise<ExtractorInfo> {
    const { playlist, songs } = await playlistWithSongs(idFromLink(link))
    const tracks = songs.map((song) => this.trackOf(song, context))
    return this.createResponse(
      new Playlist(this.context.player, {
        tracks,
        title: playlist.title,
        description: playlist.description,
        thumbnail: playlist.thumbnail,
        type: "playlist",
        source: "arbitrary",
        author: { name: playlist.ownerName, url: playlist.ownerAvatar },
        id: playlist.id,
        url: playlist.url,
      }),
      tracks,
    )
  }

  private trackOf(song: Song, context?: ExtractorSearchContext): Track {
    return new Track(this.context.player, {
      title: song.title,
      url: song.url,
      duration: millisecondsToTimeString(song.durationMs),
      thumbnail: song.thumbnail,
      author: song.artist,
      requestedBy: context?.requestedBy,
      source: "arbitrary",
      queryType: context?.type ?? QueryType.AUTO,
      metadata: song,
      requestMetadata: () => Promise.resolve(song),
    })
  }
}
