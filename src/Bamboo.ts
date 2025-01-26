import { Client, GatewayIntentBits } from "discord.js"

import { TOKEN } from "@/common/utils/config"
import * as events from "@/features/events"

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
})

Object.values(events).forEach((event) => event(client))

client.login(TOKEN).catch((error) => {
  console.error("❌ Failed to log in:", error)
})
