import {
  type GuildQueue,
  GuildQueueEvent,
  type Player,
  type Track,
} from "discord-player"

import type { QueueMetadata } from "@/common/types"

import { NowPlayingMessage } from "../embedMessages"

export default (player: Player) => {
  player.events.on(
    GuildQueueEvent.PlayerStart,
    async (queue: GuildQueue, track: Track) => {
      const { channel } = queue.metadata as QueueMetadata

      await channel.send({
        embeds: [NowPlayingMessage(track)],
      })
    },
  )
}
