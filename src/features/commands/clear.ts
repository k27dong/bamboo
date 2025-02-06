import {
  type Client,
  type CommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js"
import { useQueue } from "discord-player"

import type { Command } from "@/core/commands/Command"
import { checkInVoiceChannel } from "@/core/player/core"

const ClearOption = new SlashCommandBuilder()
.setName("clear")
.setDescription("清空播放队列")

export const Clear: Command = {
  name: ClearOption.name,
  description: ClearOption.description,
  data: ClearOption,
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

      const tracks = queue.tracks.data
      for (const track of tracks) {
        queue.node.remove(track)
      }

      await interaction.reply("done")
    } catch (error: any) {
      console.error(`❌ Error in ${Clear.name} command:`, error)
      await interaction.followUp({
        content: `❌ **Error**\n\`\`\`${error}\`\`\``,
        flags: MessageFlags.Ephemeral,
      })
    }
  },
}
