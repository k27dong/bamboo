import { SlashCommandBuilder } from "discord.js"

import { type Command, CommandName } from "./command"
import { requireQueue, requireVoice } from "./guards"

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
