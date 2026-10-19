import {
  type ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js"
import { useMainPlayer } from "discord-player"

import { UserSelectEmojiPool } from "@/constants"
import { recordedFailure } from "@/context"
import { BambooError, ErrorKind } from "@/errors"
import { queueOptions } from "@/player/player"
import { netease } from "@/sources"
import { isLink, type User as UserInfo } from "@/sources/source"
import { ErrorMessage, NowPlayingUserPlaylistMessage } from "@/ui/embeds"
import { pick } from "@/ui/pick"

import { type Command, CommandName } from "./command"
import { requireVoice } from "./guards"

/**
 * Get a deterministic emoji based on an integer input and a salt.
 * Ensures f(i, salt) and f(i+1, salt) behave the same way,
 * but f(i, salt1) and f(i, salt2) give different results.
 *
 * @param {number} i - The integer input (e.g., user ID, index)
 * @param {string | number} salt - A unique value to vary results (e.g., username, seed)
 * @returns {string} - A consistent emoji from the list
 */
const getAvatarEmoji = (i: number, salt: string | number): string => {
  // Convert salt into a numeric hash
  const saltHash = [...String(salt)].reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0,
  )

  // Compute index using both i and saltHash to vary results
  const index = (i + saltHash) % UserSelectEmojiPool.length

  return UserSelectEmojiPool[index]
}

const pickUser = async (
  interaction: ChatInputCommandInteraction,
  users: UserInfo[],
): Promise<UserInfo | null> => {
  const picked = await pick(interaction, {
    content: "❓ 找到多个用户，请选择一个",
    placeholder: "请选择用户",
    items: users,
    option: (user, index) =>
      new StringSelectMenuOptionBuilder()
        .setLabel(user.name)
        .setValue(index.toString())
        .setEmoji(getAvatarEmoji(index, interaction.createdTimestamp)),
    timeoutText: "选择超时，请重新运行命令",
  })
  if (!picked) return null

  await picked.click.update({
    content: `✅ 选择了用户: ${picked.item.name}`,
    components: [],
  })
  return picked.item
}

export const User: Command = {
  data: new SlashCommandBuilder()
    .setName(CommandName.User)
    .setDescription("播放用户歌单")
    .addStringOption((option) =>
      option
        .setName("用户名")
        .setDescription("填写网易云账号的用户名")
        .setRequired(true),
    ),
  manual:
    "在选项中填入用户名，在下拉菜单中选择用户的公开歌单，歌单中的所有歌曲将被添加到播放列表。",
  run: async ({ interaction }) => {
    const voiceChannel = requireVoice(interaction)
    const query = interaction.options.getString("用户名", true)
    if (isLink(query)) throw new BambooError(ErrorKind.NotFound)
    await interaction.deferReply({ flags: MessageFlags.Ephemeral })

    const users = await netease.users.search(query)
    if (users.length === 0) {
      await interaction.editReply({
        embeds: [ErrorMessage(`❌ 未找到用户: ${query}`)],
      })
      return
    }

    const user =
      users.length === 1 ? users[0] : await pickUser(interaction, users)
    if (!user) return

    const playlists = await netease.users.getPlaylists(user)
    if (playlists.length === 0) {
      await interaction.editReply({
        embeds: [ErrorMessage(`❌ 未找到用户公开歌单: ${user.name}`)],
      })
      return
    }

    const picked = await pick(interaction, {
      content: "🔍 请选择歌单",
      placeholder: "请选择歌单",
      items: playlists,
      option: (playlist, index) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(playlist.title)
          .setValue(index.toString())
          .setDescription(`${playlist.songCount} 首`),
      timeoutText: "❌ 歌单选择超时",
    })
    if (!picked) return

    const { item: playlist, click } = picked
    await click.update({
      content: `**歌单**: ${playlist.title} (${playlist.songCount} 首)`,
      components: [],
    })

    const player = useMainPlayer()
    const result = await player.search(playlist.url, {
      requestedBy: interaction.user,
    })
    const failure = recordedFailure()
    if (failure) throw failure
    if (!result.playlist || result.isEmpty()) {
      await interaction.editReply({
        embeds: [ErrorMessage(`❌ 未找到歌单: ${playlist.title}`)],
      })
      return
    }

    await interaction.followUp({
      embeds: [NowPlayingUserPlaylistMessage(result.playlist)],
    })

    await player.play(voiceChannel, result, {
      nodeOptions: queueOptions(interaction.channel),
    })
  },
}
