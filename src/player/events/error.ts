import { type GuildQueue, GuildQueueEvent, type Player } from "discord-player"

import { logger } from "@/logger"

export default (player: Player) => {
  player.events.on(GuildQueueEvent.Error, (_: GuildQueue, error: Error) => {
    logger.error("Queue error", error)
  })
  player.events.on(
    GuildQueueEvent.PlayerError,
    (_: GuildQueue, error: Error) => {
      logger.error("Player error", error)
    },
  )
}
