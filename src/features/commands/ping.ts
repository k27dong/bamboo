import type { Client, CommandInteraction } from "discord.js"

import type { Command } from "@/core/commands/Command"

export const Ping: Command = {
  name: "ping",
  description: "Replies with Pong!",
  run: async (_: Client, interaction: CommandInteraction) => {
    try {
      await interaction.reply("Pong!")
    } catch (error) {
      console.error("❌ Error in ping command:", error)
    }
  },
}
