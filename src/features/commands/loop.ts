import {
  type Client,
  type CommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js"
import { QueueRepeatMode, useQueue } from "discord-player"

import { logger } from "@/common/utils/logger"
import type { Command } from "@/core/commands/Command"
import { checkInVoiceChannel } from "@/core/player/core"

const LoopOption = new SlashCommandBuilder()
  .setName("loop")
  .setDescription("改变循环模式。")
  .addNumberOption((option) =>
    option
      .setName("mode")
      .setDescription("模式选择")
      .setRequired(true)
      .addChoices(
        {
          name: "顺序播放（默认）",
          value: QueueRepeatMode.OFF,
        },
        {
          name: "单曲循环",
          value: QueueRepeatMode.TRACK,
        },
        {
          name: "列表循环",
          value: QueueRepeatMode.QUEUE,
        },
        {
          name: "自动播放",
          value: QueueRepeatMode.AUTOPLAY,
        },
      ),
  )

export const Loop: Command = {
  name: LoopOption.name,
  description: LoopOption.description,
  data: LoopOption,
  manual: "改变循环模式。",
  run: async (client: Client, interaction: CommandInteraction) => {
    try {
      await checkInVoiceChannel(interaction)
      const mode = interaction.options.data[0].value as QueueRepeatMode
      const queue = useQueue(interaction.guild!)!

      if (!queue) {
        await interaction.reply(
          "This server does not have an active player session.",
        )
        return
      }

      queue.setRepeatMode(mode)

      const modeName = Object.keys(QueueRepeatMode).find(
        (key) => QueueRepeatMode[key as keyof typeof QueueRepeatMode] === mode,
      )

      await interaction.reply(`播放方式：**${modeName}**.`)
    } catch (error: any) {
      logger.error(interaction, Loop, error)

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
