import chalk from "chalk"
import { Client, GatewayIntentBits } from "discord.js"

import { config } from "@/config"
import * as clientEvents from "@/events"
import { registerPlayerEvents } from "@/player/events"
import { createPlayer } from "@/player/player"
import { registerSources } from "@/sources"

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

// Load Discord and player events
Object.values(clientEvents).forEach((event) => event(client))
registerPlayerEvents(player)

await registerSources(player)

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
