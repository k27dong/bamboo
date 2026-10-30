import { SlashCommandBuilder } from "discord.js"

import { type Command, CommandName } from "@/discord/command"
import { requirePlaying, requireVoice } from "@/player/guards"

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
