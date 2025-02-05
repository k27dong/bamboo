import {
  ActionRowBuilder,
  type Client,
  type CommandInteraction,
  ComponentType,
  MessageFlags,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js"
import { type Track, useMainPlayer } from "discord-player"

import { EXTRACTOR_IDENTIFIER, ExtractorSearchType } from "@/common/constants"
import { getAvatarEmoji } from "@/common/utils/common"
import type { Command } from "@/core/commands/Command"
import { checkInVoiceChannel } from "@/core/player/core"
import { ErrorMessage } from "@/core/player/embedMessages"

const handleUserSelect = async (
  users: Track[],
  interaction: CommandInteraction,
): Promise<string> => {
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

        resolve(selectedUser.url)
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
  run: async (client: Client, interaction: CommandInteraction) => {
    try {
      await interaction.deferReply({ ephemeral: true })
      await checkInVoiceChannel(interaction)

      const player = useMainPlayer()
      const query = interaction.options.data[0].value as string

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

      const selectedUserId =
        userSearchResult.tracks.length === 1
          ? userSearchResult.tracks[0].url
          : await handleUserSelect(userSearchResult.tracks, interaction)

      // todo now find playlists

      console.log("selected: ", selectedUserId)

      // const userPlaylistSearchResult = await player.search(selectedUserId, {
      //   requestedBy: interaction.user,
      //   searchEngine: `ext:${EXTRACTOR_IDENTIFIER}`,
      //   requestOptions: {
      //     searchType: ExtractorSearchType.UserPlaylists,
      //   },
      // })

      // if (userPlaylistSearchResult.isEmpty()) {
      //   await interaction.editReply({
      //     embeds: [ErrorMessage(`❌ 未找到用户公开歌单: ${selectedUserId}`)],
      //   })
      //   return
      // }

      await interaction.followUp("done")
    } catch (error: any) {
      console.error(`❌ Error in ${User.name} command:`, error)
      await interaction.followUp({
        content: `❌ **Error**\n\`\`\`${error}\`\`\``,
        flags: MessageFlags.Ephemeral,
      })
    }
  },
}
