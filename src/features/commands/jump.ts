import { SlashCommandBuilder } from "discord.js"

import { type Command, CommandName } from "@/core/commands/Command"
import { requireQueue, requireVoice } from "@/core/player/core"

export const Jump: Command = {
  data: new SlashCommandBuilder()
    .setName(CommandName.Jump)
    .setDescription("播放指定位置")
    .addIntegerOption((option) =>
      option.setName("位置").setDescription("播放位置").setRequired(true),
    ),
  manual: "跳转到播放列表中的指定位置，可使用 queue 指令查看索引。",
  run: async ({ interaction }) => {
    requireVoice(interaction)
    const jumpPos = interaction.options.getInteger("位置", true)
    const queue = requireQueue(interaction)

    const upcomingTracksCount = queue.tracks.data.length
    const historyTracksCount = queue.history.tracks.data.length

    if (
      jumpPos <= historyTracksCount + 1 ||
      jumpPos > historyTracksCount + upcomingTracksCount + 1
    ) {
      await interaction.reply(
        "位置错误，请输入正确的位置。输入 `queue` 查看当前播放列表。",
      )
      return
    }

    const skipCount = jumpPos - historyTracksCount - 2
    queue.node.skipTo(skipCount)

    if (!queue.isPlaying()) {
      await queue.node.play()
    }

    if (queue.node.isPaused()) {
      queue.node.resume()
    }

    await interaction.reply("done")
  },
}
