import type { Player } from "discord-player"

import error from "./error"
import start from "./start"

export const registerPlayerEvents = (player: Player) => {
  error(player)
  start(player)
}
