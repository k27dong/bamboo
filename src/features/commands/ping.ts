import {
  type Client,
  type CommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js"

import { logger } from "@/common/utils/logger"
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
      await interaction.reply(
        `Pong! The latency is ${interaction.client.ws.ping}ms`,
      )
    } catch (error: any) {
      logger.error(interaction, Ping, error)

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
