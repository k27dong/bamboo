import {
  type Client,
  type CommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js"
import { useQueue } from "discord-player"

import { logger } from "@/common/utils/logger"
import type { Command } from "@/core/commands/Command"
import { checkInVoiceChannel } from "@/core/player/core"

const SkipOption = new SlashCommandBuilder()
  .setName("skip")
  .setDescription("播放下一首")

export const Skip: Command = {
  name: SkipOption.name,
  description: SkipOption.description,
  data: SkipOption,
  manual: "切歌。",
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

      if (!queue.isPlaying() || !queue.currentTrack) {
        await interaction.reply("There is no track playing.")
        return
      }

      queue.node.skip()

      if (queue.node.isPaused()) {
        queue.node.resume()
      }

      await interaction.reply("done")
    } catch (error: any) {
      logger.error(interaction, Skip, error)

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
