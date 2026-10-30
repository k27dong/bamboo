import chalk from "chalk"
import { Client, GatewayIntentBits } from "discord.js"

import { commands } from "@/commands"
import { registerDiscordEvents } from "@/discord/events"
import { registerPlayerEvents } from "@/player/events"
import { createPlayer } from "@/player/player"
import { config } from "@/shared/config"
import { setCookie } from "@/sources/netease/client"
import { NeteaseExtractor } from "@/sources/netease/extractor"
import { login } from "@/sources/netease/login"

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error)
})
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error)
})

// Create new Discord and player clients
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
})
const player = createPlayer(client)

setCookie(await login())
await player.extractors.register(NeteaseExtractor, {})

// Load Discord and player events
registerPlayerEvents(player)
registerDiscordEvents(client, commands)

// Log in to Discord
client
  .login(config.discord.token)
  .then(() => {
    console.log(`✅ Successfully started in ${chalk.bold(config.environment)}`)
  })
  .catch((error) => {
    console.error("❌ Failed to log in:", error)
    setTimeout(() => process.exit(1), 15_000)
  })
