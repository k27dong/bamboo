import {
  type Client,
  type CommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js"
import { useQueue } from "discord-player"

import type { Command } from "@/core/commands/Command"
import { checkInVoiceChannel } from "@/core/player/core"

const JumpOption = new SlashCommandBuilder()
  .setName("jump")
  .setDescription("播放指定位置")
  .addIntegerOption((option) =>
    option.setName("位置").setDescription("播放位置").setRequired(true),
  )

export const Jump: Command = {
  name: JumpOption.name,
  description: JumpOption.description,
  data: JumpOption,
  run: async (client: Client, interaction: CommandInteraction) => {
    try {
      await checkInVoiceChannel(interaction)

      const jumpPos = interaction.options.data[0].value as number
      const queue = useQueue(interaction.guild!)!

      if (!queue) {
        await interaction.reply(
          "This server does not have an active player session.",
        )
        return
      }

      const upcomingTracksCount = queue.tracks.data.length
      const historyTracksCount = queue.history.tracks.data.length

      if (
        jumpPos < historyTracksCount ||
        jumpPos >= historyTracksCount + upcomingTracksCount
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

      await interaction.reply("Done.")
    } catch (error: any) {
      console.error(`❌ Error in ${Jump.name} command:`, error)
      await interaction.followUp({
        content: `❌ **Error**\n\`\`\`${error}\`\`\``,
        flags: MessageFlags.Ephemeral,
      })
    }
  },
}
