import { SlashCommandBuilder } from "discord.js"

import { type Command, CommandName } from "@/core/commands/Command"
import { requireQueue, requireVoice } from "@/core/player/core"

export const Back: Command = {
  data: new SlashCommandBuilder()
    .setName(CommandName.Back)
    .setDescription("播放上一首"),
  manual: "它可以帮你回到上一首播放的歌曲。不过时间是回不去了。",
  run: async ({ interaction }) => {
    requireVoice(interaction)
    const queue = requireQueue(interaction)

    if (queue.history.isEmpty()) {
      await queue.node.seek(0)
    } else {
      await queue.history.previous(true)
    }

    if (queue.node.isPaused()) {
      queue.node.resume()
    } else {
      queue.node.pause()
    }

    await interaction.reply("done")
  },
}
