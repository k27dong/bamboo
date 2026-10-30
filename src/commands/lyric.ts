import { SlashCommandBuilder } from "discord.js"

import { type Command, CommandName } from "@/discord/command"
import { askModel, fitToMessage, parseLrc } from "@/lyrics/tidy"
import { requireQueue } from "@/player/guards"
import { LYRIC_MODEL_TIMEOUT_MS, NO_LYRICS } from "@/shared/constants"
import { BambooError, ErrorKind } from "@/shared/errors"
import { logger } from "@/shared/logger"
import { getLyric, idFromLink } from "@/sources/netease/api"

export const Lyric: Command = {
  data: new SlashCommandBuilder()
    .setName(CommandName.Lyric)
    .setDescription("显示歌词"),
  manual: "显示当前播放歌曲的歌词。",
  run: async ({ interaction }) => {
    const queue = requireQueue(interaction)
    if (!queue.currentTrack) throw new BambooError(ErrorKind.NothingPlaying)
    await interaction.deferReply()
    const deadline = AbortSignal.timeout(LYRIC_MODEL_TIMEOUT_MS)

    const rawLyric = await getLyric(idFromLink(queue.currentTrack.url))
    if (!rawLyric) {
      await interaction.editReply(NO_LYRICS)
      return
    }

    const parsedLyric = parseLrc(rawLyric)
    const tidied = await askModel(rawLyric, parsedLyric, deadline)
    if ("skipped" in tidied) {
      logger.warn(`Sending bamboo's lyrics: ${tidied.skipped}`)
    }
    await interaction.editReply(
      "lines" in tidied ? fitToMessage(tidied.lines) : parsedLyric,
    )
  },
}
