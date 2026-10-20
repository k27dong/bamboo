import type { Player } from "discord-player"

import error from "./error"
import playerError from "./playerError"
import playerStart from "./playerStart"

export const registerPlayerEvents = (player: Player) => {
  error(player)
  playerError(player)
  playerStart(player)
}
