import {
  type Client,
  type CommandInteraction,
  type GuildMember,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js"
import { useMainPlayer } from "discord-player"

import { logger } from "@/common/utils/logger"
import type { Command } from "@/core/commands/Command"
import { checkInVoiceChannel } from "@/core/player/core"

const PlayOption = new SlashCommandBuilder()
  .setName("play")
  .setDescription("播放单曲")
  .addStringOption((option) =>
    option.setName("搜索").setDescription("搜索音乐").setRequired(true),
  )

export const Play: Command = {
  name: PlayOption.name,
  description: PlayOption.description,
  data: PlayOption,
  run: async (client: Client, interaction: CommandInteraction) => {
    try {
      await interaction.deferReply()
      await checkInVoiceChannel(interaction)

      const player = useMainPlayer()

      const query = interaction.options.data[0].value as string
      const member = interaction.member! as GuildMember
      const voiceChannel = member.voice.channel!

      const result = await player.play(voiceChannel, query, {
        nodeOptions: {
          metadata: { channel: interaction.channel },
          volume: 50,
          leaveOnEndCooldown: 300_000,
        },
      })

      await interaction.editReply(
        `**Queued**: ${result.track.title} ${result.track.author ? ` (${result.track.author}) ` : ""} [${result.track.duration}]`,
      )
    } catch (error: any) {
      logger.error(interaction, Play, error)

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
