import { REST, Routes } from "discord.js"

import { APPLICATION_ID, DEV_GUILD, TOKEN } from "@/common/utils/config"
import type { DeployScope } from "@/env"
import { Commands } from "@/features/commands"

const rest = new REST({ version: "10" }).setToken(TOKEN)
const skippedCommands = ["sudo"]

export async function deployCommands(mode: DeployScope) {
  try {
    console.log("🔄 Started refreshing application (/) commands.")

    let commandsData

    if (mode === "dev") {
      // Include all commands for development guild
      commandsData = Commands.map((command) => command.data.toJSON())
      await rest.put(
        Routes.applicationGuildCommands(APPLICATION_ID, DEV_GUILD),
        { body: commandsData },
      )
      console.log(
        `✅ Successfully reloaded commands for development guild: ${DEV_GUILD}`,
      )
    } else {
      const globalCommands = Commands.filter(
        (command) => !skippedCommands.includes(command.data.name),
      )

      commandsData = globalCommands.map((command) => command.data.toJSON())
      await rest.put(Routes.applicationCommands(APPLICATION_ID), {
        body: commandsData,
      })
      console.log("✅ Successfully reloaded global application (/) commands.")
      console.log(" - Commands:", globalCommands.map((c) => c.name).join(", "))
    }
  } catch (error) {
    console.error("❌ Failed to deploy commands:", error)
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

const mode = process.argv[2] as DeployScope

if (mode !== "dev" && mode !== "global") {
  console.error("❌ Invalid mode. Use 'dev' or 'global'.")
  process.exit(1)
}

deployCommands(mode).catch((error) => {
  console.error("❌ Failed to run deploy script:", error)
  process.exit(1)
})
