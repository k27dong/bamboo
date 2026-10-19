import { REST, Routes } from "discord.js"

import { commands } from "@/commands"
import { CommandName } from "@/commands/command"
import { config } from "@/config"

enum DeployScope {
  Dev = "dev",
  Global = "global",
}

const rest = new REST({ version: "10" }).setToken(config.discord.token)
const skippedCommands: readonly string[] = [CommandName.Sudo]

export async function deployCommands(mode: DeployScope) {
  try {
    console.log("🔄 Started refreshing application (/) commands.")

    let commandsData

    if (mode === DeployScope.Dev) {
      if (!config.discord.devGuildId)
        throw new Error("Missing setting DISCORD_DEV_SERVER_ID")

      // Include all commands for development guild
      commandsData = commands.map((command) => command.data.toJSON())
      await rest.put(
        Routes.applicationGuildCommands(
          config.discord.applicationId,
          config.discord.devGuildId,
        ),
        { body: commandsData },
      )
      console.log(
        `✅ Successfully reloaded commands for development guild: ${config.discord.devGuildId}`,
      )
    } else {
      const globalCommands = commands.filter(
        (command) => !skippedCommands.includes(command.data.name),
      )

      commandsData = globalCommands.map((command) => command.data.toJSON())
      await rest.put(Routes.applicationCommands(config.discord.applicationId), {
        body: commandsData,
      })
      console.log("✅ Successfully reloaded global application (/) commands.")
      console.log(
        " - Commands:",
        globalCommands.map((command) => command.data.name).join(", "),
      )
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

if (mode !== DeployScope.Dev && mode !== DeployScope.Global) {
  console.error("❌ Invalid mode. Use 'dev' or 'global'.")
  process.exit(1)
}

deployCommands(mode).catch((error) => {
  console.error("❌ Failed to run deploy script:", error)
  process.exit(1)
})
