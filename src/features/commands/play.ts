import {
  type Client,
  type CommandInteraction,
  type EmbedAuthorOptions,
  EmbedBuilder,
  type GuildMember,
  type GuildVoiceChannelResolvable,
  SlashCommandBuilder,
} from "discord.js"
import { useMainPlayer, useQueue } from "discord-player"

import type { Command } from "@/core/commands/Command"
import { checkInVoiceChannel } from "@/core/player/core"

const PlayOption = new SlashCommandBuilder()
  .setName("play")
  .setDescription("播放音乐")
  .addStringOption((option) =>
    option.setName("搜索").setDescription("搜索音乐").setRequired(true),
  )

export const Play: Command = {
  name: PlayOption.name,
  description: PlayOption.description,
  data: PlayOption,
  run: async (client: Client, interaction: CommandInteraction) => {
    try {
      await interaction.deferReply({ ephemeral: true })
      await checkInVoiceChannel(interaction)

      const player = useMainPlayer()
      const query = interaction.options.data[0].value as string
      const searchResult = await player.search(query)
      const member = interaction.member! as GuildMember
      const channel = member.voice.channel as GuildVoiceChannelResolvable

      let queue = useQueue(channel)

      if (!queue) {
        queue = player.nodes.create(channel, {
          metadata: { interaction },
          bufferingTimeout: 15000,
          leaveOnStop: false,
          leaveOnStopCooldown: 5000,
          leaveOnEnd: false,
          leaveOnEndCooldown: 15000,
          leaveOnEmpty: true,
          leaveOnEmptyCooldown: 300000,
        })
        await queue.connect(channel)
      }

      queue.addTrack(searchResult.tracks)

      if (!queue.isPlaying()) {
        await queue.node.play()
      }

      let embedData: EmbedAuthorOptions

      if (searchResult.hasPlaylist()) {
        embedData = {
          name: `Playlist “${searchResult.playlist!.title}” added to queue!`,
          iconURL: searchResult.playlist!.thumbnail,
          url: searchResult.playlist!.url,
        }
      } else {
        embedData = {
          name: `Track “${searchResult.tracks[0]?.author} - ${searchResult.tracks[0]?.title}” added to queue!`,
          iconURL: searchResult.tracks[0].thumbnail,
          url: searchResult.tracks[0].url,
        }
      }

      const playEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setAuthor({ ...embedData })

      return void interaction.editReply({ embeds: [playEmbed] })
    } catch (error) {
      console.error(`❌ Error in ${Play.name} command:`, error)
    }
  },
}
