import { SlashCommandBuilder } from "discord.js"

import { type Command, CommandName } from "@/discord/command"
import { requireQueue, requireVoice } from "@/player/guards"

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
