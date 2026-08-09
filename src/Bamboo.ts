import chalk from "chalk"
import { Client, GatewayIntentBits } from "discord.js"
import { Player } from "discord-player"

import { ApiServiceType } from "@/common/constants"
import { initializeVersion } from "@/common/utils/common"
import { ENVIROMENT, TOKEN } from "@/common/utils/config"
import { setUpCookie } from "@/common/utils/cookie"
import { BambooExtractor } from "@/core/extractor/BambooExtractor"
import * as playerEvents from "@/core/player/events"
import * as clientEvents from "@/features/events"

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error)
})
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error)
})

initializeVersion().catch((error) => {
  console.error("❌ Failed to initialize version:", error)
})

// Create new Discord and player clients
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
})
const player = new Player(client)

// Load Discord and player events
Object.values(clientEvents).forEach((event) => event(client))
Object.values(playerEvents).forEach((event) => event(player))

// Set up cookies for APIs
const neteaseCookie = await setUpCookie(ApiServiceType.Netease)

// Load extractors for player
await player.extractors.register(BambooExtractor, {
  cookies: {
    [ApiServiceType.Netease]: neteaseCookie,
  },
})

// Log in to Discord
client
  .login(TOKEN)
  .then(() => {
    console.log(`✅ Successfully started in ${chalk.bold(ENVIROMENT)}`)
  })
  .catch((error) => {
    console.error("❌ Failed to log in:", error)
    setTimeout(() => process.exit(1), 15_000)
  })
