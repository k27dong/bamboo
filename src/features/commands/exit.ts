import {
  type Client,
  type CommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js"
import { useQueue } from "discord-player"

import type { Command } from "@/core/commands/Command"
import { checkInVoiceChannel } from "@/core/player/core"

const ExitOption = new SlashCommandBuilder()
  .setName("exit")
  .setDescription("退出播放器")

export const Exit: Command = {
  name: ExitOption.name,
  description: ExitOption.description,
  data: ExitOption,
  manual: "停止播放并让Bamboo退出语音频道。",
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

      queue.delete()

      await interaction.reply("done")
    } catch (error: any) {
      console.error(`❌ Error in ${Exit.name} command:`, error)

      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply()
      }

      await interaction.followUp({
        content: `❌ **Error**\n\`\`\`${error}\`\`\``,
        flags: MessageFlags.Ephemeral,
      })
    }
  },
}
