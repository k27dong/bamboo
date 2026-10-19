import type { Player } from "discord-player"

import error from "./error"
import skip from "./skip"
import start from "./start"

export const registerPlayerEvents = (player: Player) => {
  error(player)
  skip(player)
  start(player)
}
