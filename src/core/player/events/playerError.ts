import { type GuildQueue, GuildQueueEvent, type Player } from "discord-player"

export default (player: Player) => {
  player.events.on(
    GuildQueueEvent.PlayerError,
    (_: GuildQueue, error: Error) => {
      console.error(error)
    },
  )
}
