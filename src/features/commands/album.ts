import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type Client,
  type CommandInteraction,
  ComponentType,
  EmbedBuilder,
  type GuildMember,
  MessageFlags,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js"
import { type Playlist, useMainPlayer } from "discord-player"

import {
  CustomButtonId,
  DISCORD_EMBED_DESCRIPTION_LIMIT,
  DISCORD_SELECT_MENU_LIMIT as DISCORD_SELECT_MENU_LIMIT,
  EXTRACTOR_IDENTIFIER,
  ExtractorSearchType,
} from "@/common/constants"
import { extractorSearchOptions } from "@/common/types"
import { timestampToYear } from "@/common/utils/common"
import { logger } from "@/common/utils/logger"
import type { Command } from "@/core/commands/Command"
import { checkInVoiceChannel } from "@/core/player/core"
import {
  ErrorMessage,
  NowPlayingPlaylistMessage,
} from "@/core/player/embedMessages"

const AlbumOption = new SlashCommandBuilder()
  .setName("album")
  .setDescription("专辑搜索")
  .addStringOption((option) =>
    option.setName("搜索").setDescription("专辑名").setRequired(true),
  )

export const getPlaylistEmbedInfo = (playlist: Playlist) => {
  const embed = NowPlayingPlaylistMessage(playlist)

  const components = playlist.description?.trim()
    ? [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(CustomButtonId.ShowDescription)
            .setLabel("显示描述")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("📄"),
        ),
      ]
    : []

  return { embed, components }
}

export const Album: Command = {
  name: AlbumOption.name,
  description: AlbumOption.description,
  data: AlbumOption,
  manual:
    "在选项中填入专辑名，在返回的列表中选择专辑，专辑中的所有歌曲会自动加到播放列表的末尾。",
  run: async (client: Client, interaction: CommandInteraction) => {
    try {
      await interaction.deferReply({ ephemeral: true })
      await checkInVoiceChannel(interaction)

      const player = useMainPlayer()

      const query = interaction.options.data[0].value as string
      const member = interaction.member! as GuildMember
      const voiceChannel = member.voice.channel!

      // this result is not tracks but albums
      const albumSearchResult = await player.search(query, {
        requestedBy: interaction.user,
        searchEngine: `ext:${EXTRACTOR_IDENTIFIER}`,
        requestOptions: extractorSearchOptions({
          searchType: ExtractorSearchType.AlbumLists,
        }),
      })

      if (albumSearchResult.isEmpty()) {
        await interaction.editReply({
          embeds: [ErrorMessage(`❌ 未找到专辑: ${query}`)],
        })
        return
      }

      const albumSelectRowOptions = albumSearchResult.tracks.map((track, i) => {
        const label =
          track.title.length > DISCORD_SELECT_MENU_LIMIT
            ? `${track.title.slice(0, DISCORD_SELECT_MENU_LIMIT - 3)}...`
            : track.title

        const year = timestampToYear(parseInt(track.duration, 10))
        const views = track.views.toString()

        const yearLength = year.toString().length
        const viewsLength = views.length
        const fixedPartsLength = viewsLength + yearLength + 7
        const maxAuthorLength = Math.max(
          0,
          DISCORD_SELECT_MENU_LIMIT - fixedPartsLength,
        )

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
            const selectedAlbum = albumSearchResult.tracks[selectedAlbumIndex]

            await interaction.editReply({
              content: `**专辑**: ${selectedAlbum.title} (${timestampToYear(parseInt(selectedAlbum.duration, 10))})`,
              components: [],
            })

            const albumTracks = await player.search(selectedAlbum.url, {
              requestedBy: interaction.user,
              searchEngine: `ext:${EXTRACTOR_IDENTIFIER}`,
              requestOptions: extractorSearchOptions({
          searchType: ExtractorSearchType.Album,
        }),
            })

            const { embed, components } = getPlaylistEmbedInfo(
              albumTracks.playlist!,
            )

            const albumFollowUpResponse = await interaction.followUp({
              content: "",
              embeds: [embed],
              components: components,
            })

            const selectedAlbumDescription = albumTracks.playlist!.description

            if (components.length > 0) {
              const albumFollowUpResponseCollector =
                albumFollowUpResponse.createMessageComponentCollector({
                  componentType: ComponentType.Button,
                  time: 60_000,
                })

              albumFollowUpResponseCollector.on(
                "collect",
                (albumInfoResponse) => {
                  void (async () => {
                    if (
                      albumInfoResponse.customId ===
                      CustomButtonId.ShowDescription
                    ) {
                      const updatedEmbed = EmbedBuilder.from(
                        embed,
                      ).setDescription(
                        selectedAlbumDescription.length <=
                          DISCORD_EMBED_DESCRIPTION_LIMIT
                          ? selectedAlbumDescription
                          : `${selectedAlbumDescription.substring(0, DISCORD_EMBED_DESCRIPTION_LIMIT - 4)}\n...`,
                      )

                      await albumInfoResponse.update({
                        embeds: [updatedEmbed],
                        components: [],
                      })
                      albumFollowUpResponseCollector.stop()
                    }
                  })()
                },
              )

              albumFollowUpResponseCollector.on("end", () => {
                void (async () => {
                  await albumFollowUpResponse.edit({
                    components: [],
                  })
                })()
              })
            }

            await player.play(voiceChannel, albumTracks, {
              nodeOptions: {
                metadata: {
                  channel: interaction.channel,
                  volume: 50,
                  leaveOnEndCooldown: 300_000,
                },
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
      logger.error(interaction, Album, error)

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
