import {
  type Client,
  type CommandInteraction,
  SlashCommandBuilder,
} from "discord.js"
import { useQueue } from "discord-player"

import type { Command } from "@/core/commands/Command"

const QueueOption = new SlashCommandBuilder()
  .setName("queue")
  .setDescription("显示播放队列")

export const Queue: Command = {
  name: QueueOption.name,
  description: QueueOption.description,
  data: QueueOption,
  run: async (client: Client, interaction: CommandInteraction) => {
    try {
      const queue = useQueue(interaction.guild!)!

      if (!queue) {
        await interaction.reply(
          "This server does not have an active player session.",
        )
      }

      // TODO
      console.log(queue)

      const tracks = queue.tracks.data

      console.log(tracks)
      console.log(queue.currentTrack)

      await interaction.reply("her")
    } catch (error) {
      console.error(`❌ Error in ${Queue.name} command:`, error)
    }
  },
}
