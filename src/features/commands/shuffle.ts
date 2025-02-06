import {
  type Client,
  type CommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js"
import { useQueue } from "discord-player"

import type { Command } from "@/core/commands/Command"
import { checkInVoiceChannel } from "@/core/player/core"

const ShuffleOption = new SlashCommandBuilder()
  .setName("shuffle")
  .setDescription("随机打乱播放列表")

export const Shuffle: Command = {
  name: ShuffleOption.name,
  description: ShuffleOption.description,
  data: ShuffleOption,
  run: async (client: Client, interaction: CommandInteraction) => {
    try {
      await checkInVoiceChannel(interaction)

      const queue = useQueue(interaction.guild!)!

      if (!queue) {
        await interaction.reply(
          "This server does not have an active player session.",
        )
        return
      }

      if (queue.tracks.size >= 2) {
        queue.tracks.shuffle()
      }

      await interaction.reply("done")
    } catch (error: any) {
      console.error(`❌ Error in ${Shuffle.name} command:`, error)
      await interaction.followUp({
        content: `❌ **Error**\n\`\`\`${error}\`\`\``,
        flags: MessageFlags.Ephemeral,
      })
    }
  },
}
