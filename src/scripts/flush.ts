import { REST, Routes } from "discord.js"

import { config } from "@/config"

const rest = new REST({ version: "10" }).setToken(config.discord.token)

async function flushGuildCommands() {
  try {
    if (!config.discord.devGuildId)
      throw new Error("Missing setting DISCORD_DEV_SERVER_ID")

    console.log(
      `🔄 Starting to delete all commands for guild: ${config.discord.devGuildId}`,
    )

    await rest.put(
      Routes.applicationGuildCommands(
        config.discord.applicationId,
        config.discord.devGuildId,
      ),
      { body: [] },
    )

    console.log(
      `✅ Successfully deleted all commands for guild: ${config.discord.devGuildId}`,
    )
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
