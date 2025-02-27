import {
  type Client,
  type CommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js"
import { useTimeline } from "discord-player"

import { logger } from "@/common/utils/logger"
import type { Command } from "@/core/commands/Command"
import { checkInVoiceChannel } from "@/core/player/core"

const PauseOption = new SlashCommandBuilder()
  .setName("pause")
  .setDescription("暂停/继续")

export const Pause: Command = {
  name: PauseOption.name,
  description: PauseOption.description,
  data: PauseOption,
  manual: "暂停/继续播放。",
  run: async (client: Client, interaction: CommandInteraction) => {
    try {
      await checkInVoiceChannel(interaction)

      await interaction.reply(
        `temporarily disabled (Feb 26).`,
      )

      return

      const timeline = useTimeline({
        node: interaction.guild!,
      })!

      if (!timeline) {
        await interaction.reply(
          "This server does not have an active player session.",
        )
        return
      }

      const wasPaused = timeline.paused

      if (wasPaused) {
        timeline.resume()
      } else {
        timeline.pause()
      }

      await interaction.reply(
        `Now: ${wasPaused ? "**playing**" : "**paused**"}`,
      )
    } catch (error: any) {
      logger.error(interaction, Pause, error)

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
