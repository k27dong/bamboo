import type { Player } from "discord-player"

import { setCookie } from "@/core/api/services/netease/client"
import { login } from "@/core/api/services/netease/login"
import { NeteaseExtractor } from "@/core/extractor/BambooExtractor"

export { netease } from "@/core/api/services/netease/api"

export const registerSources = async (player: Player) => {
  setCookie(await login())
  await player.extractors.register(NeteaseExtractor, {})
}
