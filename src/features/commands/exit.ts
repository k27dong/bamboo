import { SlashCommandBuilder } from "discord.js"

import { type Command, CommandName } from "@/core/commands/Command"
import { requireQueue, requireVoice } from "@/core/player/core"

export const Exit: Command = {
  data: new SlashCommandBuilder()
    .setName(CommandName.Exit)
    .setDescription("退出播放器"),
  manual: "停止播放并让Bamboo退出语音频道。",
  run: async ({ interaction }) => {
    requireVoice(interaction)
    const queue = requireQueue(interaction)

    queue.delete()

    await interaction.reply("done")
  },
}
