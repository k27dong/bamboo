import {
  type Client,
  type CommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js"
import { useQueue } from "discord-player"

import type { Command } from "@/core/commands/Command"

const SkipOption = new SlashCommandBuilder()
  .setName("skip")
  .setDescription("播放下一首")

export const Skip: Command = {
  name: SkipOption.name,
  description: SkipOption.description,
  data: SkipOption,
  run: async (client: Client, interaction: CommandInteraction) => {
    try {
      const queue = useQueue(interaction.guild!)!

      if (!queue) {
        await interaction.reply(
          "This server does not have an active player session.",
        )
        return
      }

      if (!queue.isPlaying()) {
        await interaction.reply("There is no track playing.")
        return
      }

      queue.node.skip()

      await interaction.reply("done")
    } catch (error: any) {
      console.error(`❌ Error in ${Skip.name} command:`, error)
      await interaction.followUp({
        content: `❌ **Error**\n\`\`\`${error}\`\`\``,
        flags: MessageFlags.Ephemeral,
      })
    }
  },
}
