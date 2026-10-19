import {
  BaseExtractor,
  type ExtractorInfo,
  type ExtractorSearchContext,
  type GuildQueueHistory,
  Playlist,
  QueryType,
  Track,
} from "discord-player"

import type { ExtractorSearchOptions } from "@/common/types"
import { ExtractorSearchType } from "@/constants"
import { recordFailure } from "@/context"
import { BambooError } from "@/errors"
import { millisecondsToTimeString } from "@/format"
import { logger } from "@/logger"
import { isLink, type Song } from "@/sources/source"

import {
  albumWithSongs,
  lyricsOf,
  netease,
  playlistsOf,
  playlistWithSongs,
  songIdFromLink,
} from "./api"
import { EXTRACTOR_IDENTIFIER, SONG_LINK } from "./constants"

const songFromTrack = (track: Track): Song => ({
  id: songIdFromLink(track.url),
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
    return Promise.resolve(query.startsWith(SONG_LINK) || !isLink(query))
  }

  override async handle(
    query: string,
    context: ExtractorSearchContext,
  ): Promise<ExtractorInfo> {
    const kind = (context.requestOptions as ExtractorSearchOptions | undefined)
      ?.searchType
    try {
      switch (kind) {
        case ExtractorSearchType.AlbumLists: {
          const albums = await netease.albums.search(query)
          return this.createResponse(
            null,
            albums.map(
              (album) =>
                new Track(this.context.player, {
                  title: album.title,
                  url: album.id,
                  duration: `${album.publishedAt}`,
                  author: album.artist,
                  source: "arbitrary",
                  views: album.songCount,
                }),
            ),
          )
        }
        case ExtractorSearchType.Album: {
          const { album, songs } = await albumWithSongs(query)
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
        case ExtractorSearchType.Lyric: {
          const lyrics = await lyricsOf(query)
          if (!lyrics) return this.createResponse()
          return this.createResponse(null, [
            new Track(this.context.player, {
              title: lyrics,
              requestedBy: context.requestedBy,
              source: "arbitrary",
              queryType: context.type ?? QueryType.AUTO,
            }),
          ])
        }
        case ExtractorSearchType.UserLists: {
          const users = await netease.users.search(query)
          return this.createResponse(
            null,
            users.map(
              (user) =>
                new Track(this.context.player, {
                  title: user.name,
                  url: user.id,
                  requestedBy: context.requestedBy,
                  source: "arbitrary",
                  queryType: context.type ?? QueryType.AUTO,
                }),
            ),
          )
        }
        case ExtractorSearchType.UserPlaylists: {
          const playlists = await playlistsOf(query)
          return this.createResponse(
            null,
            playlists.map(
              (playlist) =>
                new Track(this.context.player, {
                  title: playlist.title,
                  url: playlist.id,
                  thumbnail: playlist.thumbnail,
                  author: `${playlist.songCount}`,
                  requestedBy: context.requestedBy,
                  source: "arbitrary",
                  queryType: context.type ?? QueryType.AUTO,
                }),
            ),
          )
        }
        case ExtractorSearchType.UserPlaylistTracks: {
          const { playlist, songs } = await playlistWithSongs(query)
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
        default: {
          const [song] = await netease.searchSongs(query)
          return this.createResponse(
            null,
            song ? [this.trackOf(song, context)] : [],
          )
        }
      }
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
