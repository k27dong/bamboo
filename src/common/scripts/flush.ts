import { REST, Routes } from "discord.js"

import { APPLICATION_ID, DEV_GUILD, TOKEN } from "@/common/utils/config"

const rest = new REST({ version: "10" }).setToken(TOKEN)

async function flushGuildCommands() {
  try {
    if (!DEV_GUILD) throw new Error("Missing setting DISCORD_DEV_SERVER_ID")

    console.log(`🔄 Starting to delete all commands for guild: ${DEV_GUILD}`)

    await rest.put(Routes.applicationGuildCommands(APPLICATION_ID, DEV_GUILD), {
      body: [],
    })

    console.log(`✅ Successfully deleted all commands for guild: ${DEV_GUILD}`)
  } catch (error) {
    console.error("❌ Failed to delete commands:", error)
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      })
    } else {
      console.error("Unknown error:", error)
    }
  }
}

flushGuildCommands().catch((error) => {
  console.error("❌ Failed to run flush script:", error)
  process.exit(1)
})
