import type { Player } from "discord-player"

import error from "./error"
import playerError from "./playerError"
import playerStart from "./playerStart"
import skip from "./skip"

export const registerPlayerEvents = (player: Player) => {
  error(player)
  playerError(player)
  skip(player)
  playerStart(player)
}
