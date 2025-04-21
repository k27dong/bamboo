import {
  type GuildQueue,
  GuildQueueEvent,
  type Player,
  type Track,
} from "discord-player"

import type { QueueMetadata } from "@/common/types"
import { logger } from "@/common/utils/logger"

import { NowPlayingMessage } from "../embedMessages"

export default (player: Player) => {
  player.events.on(
    GuildQueueEvent.PlayerStart,
    async (queue: GuildQueue, track: Track) => {
      const { channel } = queue.metadata as QueueMetadata

      logger.player(queue.channel, track.title)

      await channel.send({
        embeds: [NowPlayingMessage(track, queue)],
      })
    },
  )
}
