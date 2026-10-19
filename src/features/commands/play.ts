import {
  type ChatInputCommandInteraction,
  type Client,
  type GuildMember,
  MessageFlags,
  SlashCommandBuilder,
  type TextChannel,
} from "discord.js"
import { useMainPlayer } from "discord-player"

import type { Command } from "@/core/commands/Command"
import { checkInVoiceChannel } from "@/core/player/core"
import { BambooError, ErrorKind } from "@/errors"
import { logger } from "@/logger"
import { queueOptions } from "@/player/player"
import { isLink } from "@/sources/source"

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
  run: async (client: Client, interaction: ChatInputCommandInteraction) => {
    try {
      await interaction.deferReply()
      await checkInVoiceChannel(interaction)

      const player = useMainPlayer()

      const query = interaction.options.data[0].value as string
      if (isLink(query)) throw new BambooError(ErrorKind.NotFound)
      const member = interaction.member! as GuildMember
      const voiceChannel = member.voice.channel!

      const result = await player.play(voiceChannel, query, {
        nodeOptions: queueOptions(interaction.channel as TextChannel),
      })

      await interaction.editReply(
        `**Queued**: ${result.track.title} ${result.track.author ? ` (${result.track.author}) ` : ""} [${result.track.duration}]`,
      )
    } catch (error: any) {
      logger.error(`/${Play.name} failed`, error)

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
