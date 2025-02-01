import {
  ActionRowBuilder,
  type Client,
  type CommandInteraction,
  ComponentType,
  type GuildMember,
  MessageFlags,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js"
import { useMainPlayer } from "discord-player"

import { EXTRACTOR_IDENTIFIER, ExtractorSearchType } from "@/common/constants"
import { timestampToYear } from "@/common/utils/common"
import type { Command } from "@/core/commands/Command"
import { checkInVoiceChannel } from "@/core/player/core"

const AlbumOption = new SlashCommandBuilder()
  .setName("album")
  .setDescription("专辑搜索")
  .addStringOption((option) =>
    option.setName("搜索").setDescription("专辑名").setRequired(true),
  )

export const Album: Command = {
  name: AlbumOption.name,
  description: AlbumOption.description,
  data: AlbumOption,
  run: async (client: Client, interaction: CommandInteraction) => {
    try {
      await interaction.deferReply({ ephemeral: true })
      await checkInVoiceChannel(interaction)

      const player = useMainPlayer()

      const query = interaction.options.data[0].value as string
      const member = interaction.member! as GuildMember
      const voiceChannel = member.voice.channel!

      // this result is not tracks but albums
      const result = await player.search(query, {
        requestedBy: interaction.user,
        searchEngine: `ext:${EXTRACTOR_IDENTIFIER}`,
        requestOptions: {
          searchType: ExtractorSearchType.AlbumLists,
        },
      })

      const MAX_LENGTH = 100

      const albumSelectRowOptions = result.tracks.map((track, i) => {
        const label =
          track.title.length > MAX_LENGTH
            ? `${track.title.slice(0, MAX_LENGTH - 3)}...`
            : track.title

        const year = timestampToYear(parseInt(track.duration, 10))
        const views = track.views.toString()

        const yearLength = year.toString().length
        const viewsLength = views.length
        const fixedPartsLength = viewsLength + yearLength + 7
        const maxAuthorLength = Math.max(0, MAX_LENGTH - fixedPartsLength)

        const author =
          track.author.length > maxAuthorLength
            ? `${track.author.slice(0, maxAuthorLength - 3)}...`
            : track.author

        return new StringSelectMenuOptionBuilder()
          .setLabel(label)
          .setValue(i.toString())
          .setDescription(`${author} | ${views}首 | ${year}`)
          .setEmoji("💿")
      })

      const albumSelectRow =
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("starter")
            .setPlaceholder("Make a selection!")
            .addOptions(albumSelectRowOptions),
        )

      const responseInteraction = await interaction.editReply({
        content: "🔍 请选择专辑",
        components: [albumSelectRow],
      })

      const albumSelectionResponseCollector =
        responseInteraction.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          time: 30000,
        })

      albumSelectionResponseCollector.on("collect", (response) => {
        void (async () => {
          if (response.user.id !== interaction.user.id) {
            await response.reply({
              content: "❌ 请不要干扰他人选择",
              ephemeral: true,
            })
          } else {
            const selectedAlbumIndex = parseInt(response.values[0], 10)
            const selectedAlbum = result.tracks[selectedAlbumIndex]

            await response.reply({
              content: `**专辑**: ${selectedAlbum.title} (${timestampToYear(parseInt(selectedAlbum.duration, 10))})`,
              ephemeral: true,
            })

            const albumTracks = await player.search(selectedAlbum.url, {
              requestedBy: interaction.user,
              searchEngine: `ext:${EXTRACTOR_IDENTIFIER}`,
              requestOptions: {
                searchType: ExtractorSearchType.Album,
              },
            })

            await player.play(voiceChannel, albumTracks, {
              nodeOptions: {
                metadata: { channel: interaction.channel },
              },
            })
          }
        })()
      })

      albumSelectionResponseCollector.on("end", (response) => {
        void (async () => {
          if (response.size === 0) {
            await interaction.editReply({
              content: "❌ 专辑选择超时",
              components: [],
            })
          }
        })()
      })
    } catch (error: any) {
      console.error(`❌ Error in ${Album.name} command:`, error)
      await interaction.followUp({
        content: `❌ **Error**\n\`\`\`${error}\`\`\``,
        flags: MessageFlags.Ephemeral,
      })
    }
  },
}
