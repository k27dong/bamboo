import { SlashCommandBuilder } from "discord.js"
import { QueueRepeatMode } from "discord-player"

import { REPEAT_MODE_LABELS } from "@/constants"

import { type Command, CommandName } from "./command"
import { requireQueue, requireVoice } from "./guards"

export const Loop: Command = {
  data: new SlashCommandBuilder()
    .setName(CommandName.Loop)
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
    ),
  manual: "改变循环模式。",
  run: async ({ interaction }) => {
    requireVoice(interaction)
    const mode = interaction.options.getNumber("mode", true) as QueueRepeatMode
    const queue = requireQueue(interaction)

    queue.setRepeatMode(mode)

    await interaction.reply(`播放方式：**${REPEAT_MODE_LABELS[mode]}**.`)
  },
}
