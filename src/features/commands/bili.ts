import {
  type Client,
  type CommandInteraction,
  type GuildMember,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js"
import { useMainPlayer } from "discord-player"

import {
  BILIBILI_ERROR_CODES,
  EXTRACTOR_IDENTIFIER,
  ExtractorSearchType,
} from "@/common/constants"
import { processBilibiliUrl } from "@/common/utils/common"
import { logger } from "@/common/utils/logger"
import type { Command } from "@/core/commands/Command"
import { checkInVoiceChannel } from "@/core/player/core"
import type { BVideoMetadata } from "@/env"

const BiliOption = new SlashCommandBuilder()
  .setName("bili")
  .setDescription("播放Bilibili视频")
  .addStringOption((option) =>
    option
      .setName("链接")
      .setDescription("Bilibili视频链接或ID")
      .setRequired(true),
  )

export const Bili: Command = {
  name: BiliOption.name,
  description: BiliOption.description,
  data: BiliOption,
  run: async (client: Client, interaction: CommandInteraction) => {
    try {
      await interaction.deferReply()
      await checkInVoiceChannel(interaction)

      const player = useMainPlayer()

      const query = interaction.options.data[0].value as string
      const member = interaction.member! as GuildMember
      const voiceChannel = member.voice.channel!
      const bvid = processBilibiliUrl(query)

      if (!bvid) {
        await interaction.editReply(
          `❌ Invalid Bilibili video URL or ID: \`${query}\``,
        )
        return
      }

      const bVideoSearchResult = await player.search(bvid, {
        requestedBy: interaction.user,
        searchEngine: `ext:${EXTRACTOR_IDENTIFIER}`,
        requestOptions: {
          searchType: ExtractorSearchType.BilibiliVideo,
        },
      })

      const metadata = bVideoSearchResult.tracks[0].metadata as BVideoMetadata

      switch (metadata.statusCode) {
        case BILIBILI_ERROR_CODES.REQUEST_ERROR:
          throw new Error("请求错误")
        case BILIBILI_ERROR_CODES.PERMISSION_DENIED:
          throw new Error("权限错误")
        case BILIBILI_ERROR_CODES.NOT_FOUND:
          throw new Error("视频不存在")
        case BILIBILI_ERROR_CODES.VIDEO_INVISIBLE:
          throw new Error("视频已设置为不公开")
        case BILIBILI_ERROR_CODES.VIDEO_UNDER_REVIEW:
          throw new Error("视频正在审核中")
        case BILIBILI_ERROR_CODES.VIDEO_PRIVATE:
          throw new Error("视频已设置为私密")
        case BILIBILI_ERROR_CODES.INVALID_BVID:
          throw new Error("无效的Bilibili视频ID")
        case BILIBILI_ERROR_CODES.NO_DATA:
          throw new Error("视频不存在")
        case BILIBILI_ERROR_CODES.UNKNOWN_ERROR:
          throw new Error("未知错误")
        case BILIBILI_ERROR_CODES.SUCCESS:
        default:
          break
      }

      await player.play(voiceChannel, bVideoSearchResult, {
        nodeOptions: {
          metadata: { channel: interaction.channel },
          volume: 50,
          leaveOnEndCooldown: 300_000,
        },
      })

      await interaction.editReply(
        `**Queued**: ${metadata.totalTitle} [${metadata.totalDuration}]`,
      )
    } catch (error: any) {
      logger.error(interaction, Bili, error)

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
