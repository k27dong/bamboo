import { SlashCommandBuilder } from "discord.js"

import { type Command, CommandName } from "@/core/commands/Command"
import { requireQueue, requireVoice } from "@/core/player/core"

export const Shuffle: Command = {
  data: new SlashCommandBuilder()
    .setName(CommandName.Shuffle)
    .setDescription("随机打乱播放列表"),
  manual: "随机打乱播放列表。",
  run: async ({ interaction }) => {
    requireVoice(interaction)
    const queue = requireQueue(interaction)

    if (queue.tracks.size >= 2) {
      queue.tracks.shuffle()
    }

    await interaction.reply("done")
  },
}
