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
import { type Track, useMainPlayer } from "discord-player"

import { EXTRACTOR_IDENTIFIER, ExtractorSearchType } from "@/common/constants"
import { getAvatarEmoji } from "@/common/utils/common"
import { logger } from "@/common/utils/logger"
import type { Command } from "@/core/commands/Command"
import { checkInVoiceChannel } from "@/core/player/core"
import {
  ErrorMessage,
  NowPlayingUserPlaylistMessage,
} from "@/core/player/embedMessages"

const handleUserSelect = async (
  users: Track[],
  interaction: CommandInteraction,
): Promise<string[]> => {
  const userSelectRowOptions = users.map((user, i) => {
    return new StringSelectMenuOptionBuilder()
      .setLabel(user.title)
      .setValue(i.toString())
      .setEmoji(getAvatarEmoji(i, interaction.createdTimestamp))
  })

  const userSelectRow =
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("starter")
        .setPlaceholder("请选择用户")
        .addOptions(userSelectRowOptions),
    )

  const responseInteraction = await interaction.editReply({
    content: `❓ 找到多个用户，请选择一个`,
    components: [userSelectRow],
  })

  return new Promise((resolve, reject) => {
    const userSelectResponseCollector =
      responseInteraction.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 30000,
      })

    userSelectResponseCollector.on("collect", (selectInteraction) => {
      void (async () => {
        if (selectInteraction.user.id !== interaction.user.id) {
          await selectInteraction.reply({
            content: "❌ 请不要干扰他人选择",
            ephemeral: true,
          })
          return
        }

        const selectedUser = users[parseInt(selectInteraction.values[0])]
        await selectInteraction.update({
          content: `✅ 选择了用户: ${selectedUser.title}`,
          components: [],
        })

        resolve([selectedUser.url, selectedUser.title])
        userSelectResponseCollector.stop()
      })()
    })

    userSelectResponseCollector.on("end", (_, reason) => {
      if (reason === "time") {
        reject(new Error("选择超时，请重新运行命令"))
      }
    })
  })
}

const UserOption = new SlashCommandBuilder()
  .setName("user")
  .setDescription("播放用户歌单")
  .addStringOption((option) =>
    option
      .setName("用户名")
      .setDescription("填写网易云账号的用户名")
      .setRequired(true),
  )

export const User: Command = {
  name: UserOption.name,
  description: UserOption.description,
  data: UserOption,
  manual:
    "在选项中填入用户名，在下拉菜单中选择用户的公开歌单，歌单中的所有歌曲将被添加到播放列表。",
  run: async (client: Client, interaction: CommandInteraction) => {
    try {
      await interaction.deferReply({ ephemeral: true })
      await checkInVoiceChannel(interaction)

      const player = useMainPlayer()
      const query = interaction.options.data[0].value as string
      const member = interaction.member! as GuildMember
      const voiceChannel = member.voice.channel!

      // this result will be a list of users
      const userSearchResult = await player.search(query, {
        requestedBy: interaction.user,
        searchEngine: `ext:${EXTRACTOR_IDENTIFIER}`,
        requestOptions: {
          searchType: ExtractorSearchType.UserLists,
        },
      })

      if (userSearchResult.isEmpty()) {
        await interaction.editReply({
          embeds: [ErrorMessage(`❌ 未找到用户: ${query}`)],
        })
        return
      }

      const [selectedUserId, selectedUserName] =
        userSearchResult.tracks.length === 1
          ? [userSearchResult.tracks[0].url, userSearchResult.tracks[0].title]
          : await handleUserSelect(userSearchResult.tracks, interaction)

      const userPlaylistSearchResult = await player.search(selectedUserId, {
        requestedBy: interaction.user,
        searchEngine: `ext:${EXTRACTOR_IDENTIFIER}`,
        requestOptions: {
          searchType: ExtractorSearchType.UserPlaylists,
        },
      })

      if (userPlaylistSearchResult.isEmpty()) {
        await interaction.editReply({
          embeds: [ErrorMessage(`❌ 未找到用户公开歌单: ${selectedUserName}`)],
        })
        return
      }

      const playlistSelectRowOptions = userPlaylistSearchResult.tracks.map(
        (playlist, i) => {
          return new StringSelectMenuOptionBuilder()
            .setLabel(playlist.title.toString())
            .setValue(i.toString())
            .setDescription(`${playlist.author} 首`)
        },
      )

      const playlistSelectRow =
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("starter")
            .setPlaceholder("请选择歌单")
            .addOptions(playlistSelectRowOptions),
        )

      const responseInteraction = await interaction.editReply({
        content: "🔍 请选择歌单",
        components: [playlistSelectRow],
      })

      const playlistSelectionResponseCollector =
        responseInteraction.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          time: 30000,
        })

      playlistSelectionResponseCollector.on("collect", (response) => {
        void (async () => {
          if (response.user.id !== interaction.user.id) {
            await response.reply({
              content: "❌ 请不要干扰他人选择",
              ephemeral: true,
            })
          } else {
            const selectedPlaylistIndex = parseInt(response.values[0], 10)
            const selectedPlaylist =
              userPlaylistSearchResult.tracks[selectedPlaylistIndex]

            await interaction.editReply({
              content: `**歌单**: ${selectedPlaylist.title} (${selectedPlaylist.author} 首)`,
              components: [],
            })

            const playlistTracks = await player.search(selectedPlaylist.url, {
              requestedBy: interaction.user,
              searchEngine: `ext:${EXTRACTOR_IDENTIFIER}`,
              requestOptions: {
                searchType: ExtractorSearchType.UserPlaylistTracks,
              },
            })

            if (playlistTracks.isEmpty()) {
              await interaction.editReply({
                embeds: [
                  ErrorMessage(`❌ 未找到歌单: ${selectedPlaylist.title}`),
                ],
              })
              return
            }

            await interaction.followUp({
              content: "",
              embeds: [NowPlayingUserPlaylistMessage(playlistTracks.playlist!)],
            })

            await player.play(voiceChannel, playlistTracks, {
              nodeOptions: {
                metadata: { channel: interaction.channel },
                volume: 50,
                leaveOnEndCooldown: 300_000,
              },
            })
          }
        })()
      })

      playlistSelectionResponseCollector.on("end", (response) => {
        void (async () => {
          if (response.size === 0) {
            await interaction.editReply({
              content: "❌ 歌单选择超时",
              components: [],
            })
          }
        })()
      })
    } catch (error: any) {
      logger.error(interaction, User, error)

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
