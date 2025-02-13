import {
  type Client,
  type CommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js"
import { useHistory, useTimeline } from "discord-player"

import { logger } from "@/common/utils/logger"
import type { Command } from "@/core/commands/Command"
import { checkInVoiceChannel } from "@/core/player/core"

const BackOption = new SlashCommandBuilder()
  .setName("back")
  .setDescription("播放上一首")

export const Back: Command = {
  name: BackOption.name,
  description: BackOption.description,
  data: BackOption,
  manual: "它可以帮你回到上一首播放的歌曲。不过时间是回不去了。",
  run: async (client: Client, interaction: CommandInteraction) => {
    try {
      await checkInVoiceChannel(interaction)

      const history = useHistory(interaction.guild!)!
      const timeline = useTimeline({ node: interaction.guildId! })

      if (!history || history.isEmpty()) {
        await timeline?.setPosition(0)
      } else {
        await history.previous(true)
      }

      await interaction.reply("done")
    } catch (error: any) {
      logger.error(interaction, Back, error)

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
