import type { Player } from "discord-player"

import { setCookie } from "./netease/client"
import { NeteaseExtractor } from "./netease/extractor"
import { login } from "./netease/login"

export { netease } from "./netease/api"
export { songFromTrack } from "./netease/extractor"

export const registerSources = async (player: Player) => {
  setCookie(await login())
  await player.extractors.register(NeteaseExtractor, {})
}
