import { SlashCommandBuilder } from "discord.js"

import { type Command, CommandName } from "@/core/commands/Command"
import { requireQueue, requireVoice } from "@/core/player/core"

export const Clear: Command = {
  data: new SlashCommandBuilder()
    .setName(CommandName.Clear)
    .setDescription("清空播放队列"),
  manual: "移除播放队列中的所有歌曲，不影响正在播放的曲目。",
  run: async ({ interaction }) => {
    requireVoice(interaction)
    const queue = requireQueue(interaction)

    const tracks = queue.tracks.data
    for (const track of tracks) {
      queue.node.remove(track)
    }

    await interaction.reply("done")
  },
}
