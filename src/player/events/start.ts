import {
  type GuildQueue,
  GuildQueueEvent,
  type Player,
  type Track,
} from "discord-player"

import { logger } from "@/logger"
import type { QueueMetadata } from "@/player/player"
import { NowPlayingMessage } from "@/ui/embeds"

export default (player: Player) => {
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
