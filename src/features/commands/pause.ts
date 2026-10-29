import { SlashCommandBuilder } from "discord.js"

import { type Command, CommandName } from "@/core/commands/Command"
import { requireQueue, requireVoice } from "@/core/player/core"

export const Pause: Command = {
  data: new SlashCommandBuilder()
    .setName(CommandName.Pause)
    .setDescription("暂停/继续"),
  manual: "暂停/继续播放。",
  run: async ({ interaction }) => {
    requireVoice(interaction)
    const queue = requireQueue(interaction)

    const wasPaused = queue.node.isPaused()

    if (wasPaused) {
      queue.node.resume()
    } else {
      queue.node.pause()
    }

    await interaction.reply(`Now: ${wasPaused ? "**playing**" : "**paused**"}`)
  },
}
