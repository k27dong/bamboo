import {
  type ChatInputCommandInteraction,
  type Client,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js"

import type { Command } from "@/core/commands/Command"
import { logger } from "@/logger"

const PingOption = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("replies with Pong!")

export const Ping: Command = {
  name: PingOption.name,
  description: PingOption.description,
  data: PingOption,
  run: async (_: Client, interaction: ChatInputCommandInteraction) => {
    try {
      await interaction.reply(
        `Pong! The latency is ${interaction.client.ws.ping}ms`,
      )
    } catch (error: any) {
      logger.error(`/${Ping.name} failed`, error)

      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply()
      }

      await interaction.followUp({
        content: `❌ **Error**\n\`\`\`${error}\`\`\``,
        flags: MessageFlags.Ephemeral,
      })
    }
  },
}
