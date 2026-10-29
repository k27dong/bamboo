import chalk from "chalk"
import { Client, GatewayIntentBits } from "discord.js"

import { config } from "@/common/utils/config"
import { registerSources } from "@/core/api/BambooApi"
import { registerPlayerEvents } from "@/core/player/events"
import { createPlayer } from "@/core/player/player"
import * as clientEvents from "@/features/events"

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

await registerSources(player)

// Load Discord and player events
registerPlayerEvents(player)
Object.values(clientEvents).forEach((event) => event(client))

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
