import { type GuildQueue, GuildQueueEvent, type Player } from "discord-player"

import { logger } from "@/common/utils/logger"

export default (player: Player) => {
  player.events.on(GuildQueueEvent.Error, (_: GuildQueue, error: Error) => {
    logger.error("Queue error", error)
  })
}
