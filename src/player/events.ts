import {
  type GuildQueue,
  GuildQueueEvent,
  type Player,
  QueueRepeatMode,
  type Track,
  TrackSkipReason,
} from "discord-player"

import { NowPlayingMessage } from "@/discord/embeds"
import { logger } from "@/shared/logger"

import type { QueueMetadata } from "./player"

export const registerPlayerEvents = (player: Player) => {
  player.events.on(GuildQueueEvent.Error, (_: GuildQueue, error: Error) => {
    logger.error("Queue error", error)
  })

  player.events.on(
    GuildQueueEvent.PlayerError,
    (_: GuildQueue, error: Error) => {
      logger.error("Player error", error)
    },
  )

  player.events.on(
    GuildQueueEvent.PlayerSkip,
    (queue: GuildQueue, track: Track, reason: TrackSkipReason) => {
      const lastSongCantPlay =
        reason === TrackSkipReason.NoStream &&
        track === queue.currentTrack &&
        queue.tracks.size === 0
      const looping =
        queue.repeatMode === QueueRepeatMode.TRACK ||
        queue.repeatMode === QueueRepeatMode.QUEUE

      if (lastSongCantPlay && looping) {
        queue.setRepeatMode(QueueRepeatMode.OFF)
        logger.warn(`Turned loop off because ${track.title} can't play`)
      }
    },
  )

  player.events.on(
    GuildQueueEvent.PlayerStart,
    async (queue: GuildQueue, track: Track) => {
      const { channel } = queue.metadata as QueueMetadata

      logger.player(queue.channel, track.title)

      if (channel) {
        await channel.send({
          embeds: [NowPlayingMessage(track, queue)],
        })
      } else {
        logger.warn(`No channel to post Now Playing for ${track.title}`)
      }
    },
  )
}
