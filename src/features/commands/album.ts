import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js"
import { type Playlist, useMainPlayer } from "discord-player"
import { isMatching } from "ts-pattern"

import {
  CustomButtonId,
  DESCRIPTION_BUTTON_TIMEOUT_MS,
  DISCORD_EMBED_DESCRIPTION_LIMIT,
  DISCORD_SELECT_MENU_LIMIT,
} from "@/common/constants"
import { recordedFailure } from "@/common/context"
import { BambooError, ErrorKind } from "@/common/errors"
import { isLink, timestampToYear } from "@/common/utils/common"
import { searchAlbums } from "@/core/api/services/netease/api"
import { ALBUM_LINK } from "@/core/api/services/netease/constants"
import type { NeteaseAlbumWithArtist } from "@/core/api/services/netease/types"
import { type Command, CommandName } from "@/core/commands/Command"
import { pick } from "@/core/commands/pick"
import { requireVoice } from "@/core/player/core"
import {
  ErrorMessage,
  NowPlayingPlaylistMessage,
} from "@/core/player/embedMessages"
import { queueOptions } from "@/core/player/player"

const albumOption = (album: NeteaseAlbumWithArtist, index: number) => {
  const label =
    album.name.length > DISCORD_SELECT_MENU_LIMIT
      ? `${album.name.slice(0, DISCORD_SELECT_MENU_LIMIT - 3)}...`
      : album.name

  const year = timestampToYear(album.publishTime)
  const views = album.size.toString()
  const artist = album.artists[0].name

  const yearLength = year.toString().length
  const viewsLength = views.length
  const fixedPartsLength = viewsLength + yearLength + 7
  const maxAuthorLength = Math.max(
    0,
    DISCORD_SELECT_MENU_LIMIT - fixedPartsLength,
  )

  const author =
    artist.length > maxAuthorLength
      ? `${artist.slice(0, maxAuthorLength - 3)}...`
      : artist

  return new StringSelectMenuOptionBuilder()
    .setLabel(label)
    .setValue(index.toString())
    .setDescription(`${author} | ${views}首 | ${year}`)
    .setEmoji("💿")
}

const showAlbumCard = async (
  interaction: ChatInputCommandInteraction,
  playlist: Playlist,
) => {
  const embed = NowPlayingPlaylistMessage(playlist)
  const description = playlist.description.trim()
  const components = description
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

  const card = await interaction.followUp({ embeds: [embed], components })
  if (!description) return

  const clicks = card.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: DESCRIPTION_BUTTON_TIMEOUT_MS,
  })

  clicks.on("collect", (click) => {
    void (async () => {
      if (!isMatching(CustomButtonId.ShowDescription, click.customId)) return
      await click.update({
        embeds: [
          EmbedBuilder.from(embed).setDescription(
            description.length <= DISCORD_EMBED_DESCRIPTION_LIMIT
              ? description
              : `${description.substring(0, DISCORD_EMBED_DESCRIPTION_LIMIT - 4)}\n...`,
          ),
        ],
        components: [],
      })
      clicks.stop()
    })()
  })

  clicks.on("end", (collected) => {
    if (collected.size === 0) void card.edit({ components: [] })
  })
}

export const Album: Command = {
  data: new SlashCommandBuilder()
    .setName(CommandName.Album)
    .setDescription("专辑搜索")
    .addStringOption((option) =>
      option.setName("搜索").setDescription("专辑名").setRequired(true),
    ),
  manual:
    "在选项中填入专辑名，在返回的列表中选择专辑，专辑中的所有歌曲会自动加到播放列表的末尾。",
  run: async ({ interaction }) => {
    const voiceChannel = requireVoice(interaction)
    const query = interaction.options.getString("搜索", true)
    if (isLink(query)) throw new BambooError(ErrorKind.NotFound)
    await interaction.deferReply({ flags: MessageFlags.Ephemeral })

    const albums = await searchAlbums(query)
    if (albums.length === 0) {
      await interaction.editReply({
        embeds: [ErrorMessage(`❌ 未找到专辑: ${query}`)],
      })
      return
    }

    const picked = await pick(interaction, {
      content: "🔍 请选择专辑",
      placeholder: "Make a selection!",
      items: albums,
      option: albumOption,
      timeoutText: "❌ 专辑选择超时",
    })
    if (!picked) return

    const { item: album, click } = picked
    await click.update({
      content: `**专辑**: ${album.name} (${timestampToYear(album.publishTime)})`,
      components: [],
    })

    const player = useMainPlayer()
    const result = await player.search(`${ALBUM_LINK}${album.id}`, {
      requestedBy: interaction.user,
    })
    const failure = recordedFailure()
    if (failure) throw failure
    if (!result.playlist || result.isEmpty()) {
      await interaction.editReply({
        embeds: [ErrorMessage(`❌ 未找到专辑: ${album.name}`)],
      })
      return
    }

    await showAlbumCard(interaction, result.playlist)
    await player.play(voiceChannel, result, {
      nodeOptions: queueOptions(interaction.channel),
    })
  },
}
