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
  .setDescription("回复你一个Pong! 乒乒乓乓!")

export const Ping: Command = {
  name: PingOption.name,
  description: PingOption.description,
  data: PingOption,
  manual: "查看与Bamboo机器人的网络延时。",
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
