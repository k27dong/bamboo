import { SlashCommandBuilder } from "discord.js"

import { type Command, CommandName } from "@/core/commands/Command"
import { requirePlaying, requireVoice } from "@/core/player/core"

export const Skip: Command = {
  data: new SlashCommandBuilder()
    .setName(CommandName.Skip)
    .setDescription("播放下一首"),
  manual: "切歌。",
  run: async ({ interaction }) => {
    requireVoice(interaction)
    const queue = requirePlaying(interaction)

    queue.node.skip()

    if (queue.node.isPaused()) {
      queue.node.resume()
    }

    await interaction.reply("done")
  },
}
