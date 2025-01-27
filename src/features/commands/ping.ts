import {
  type Client,
  type CommandInteraction,
  SlashCommandBuilder,
} from "discord.js"

import type { Command } from "@/core/commands/Command"

const PingOption = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("replies with Pong!")

export const Ping: Command = {
  name: PingOption.name,
  description: PingOption.description,
  data: PingOption,
  run: async (_: Client, interaction: CommandInteraction) => {
    try {
      await interaction.reply("Pong!")
    } catch (error) {
      console.error("❌ Error in ping command:", error)
    }
  },
}
