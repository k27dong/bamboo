import { DefaultExtractors } from "@discord-player/extractor"
import { Client, GatewayIntentBits } from "discord.js"
import { Player } from "discord-player"
import { YoutubeiExtractor } from "discord-player-youtubei"

import { TOKEN } from "@/common/utils/config"
import * as playerEvents from "@/core/player/events"
import * as clientEvents from "@/features/events"

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
})
const player = new Player(client)

Object.values(clientEvents).forEach((event) => event(client))
Object.values(playerEvents).forEach((event) => event(player))

await player.extractors.loadMulti(DefaultExtractors)
await player.extractors.register(YoutubeiExtractor, {})

client.login(TOKEN).catch((error) => {
  console.error("❌ Failed to log in:", error)
})
