import { SlashCommandBuilder } from "discord.js"
import OpenAI from "openai"

import { DISCORD_MESSAGE_CHAR_LIMIT, NO_LYRICS } from "@/common/constants"
import { BambooError, ErrorKind } from "@/common/errors"
import { LYRIC_SANITIZATION_PROMPT } from "@/common/prompts"
import { config } from "@/common/utils/config"
import { logger } from "@/common/utils/logger"
import { netease, songFromTrack } from "@/core/api/BambooApi"
import { type Command, CommandName } from "@/core/commands/Command"
import { requireQueue } from "@/core/player/core"

const getGptParsedLyric = async (
  rawLyric: string,
  parsedLyric: string,
): Promise<string> => {
  const openai = new OpenAI({
    apiKey: config.openaiApiKey,
  })
  const response = await openai.chat.completions.create({
    messages: [
      { role: "system", content: LYRIC_SANITIZATION_PROMPT },
      {
        role: "user",
        content: `Raw lyrics: ${rawLyric}\n\nParsed lyrics: ${parsedLyric}\n\nSummarize per the rules.`,
      },
    ],
    store: false,
    model: "gpt-4o-mini",
  })

  const { content } = response.choices[0].message
  if (content === null) throw new Error("The model returned no lyrics")
  return content
}

const parseLrc = (lrc: string): string => {
  const sanitizedLines = lrc
    .split("\n")
    .map((line) =>
      line
        .replace(/\[\d{1,2}:\d{2}(?:\.\d{1,3})?\]/g, "") // Timestamps
        .replace(/\s+/g, " ") // Whitespace
        .replace(/([!?,.])(?=\S)/g, "$1 ") // Punctuation spacing
        .replace(/(\s)([!?,.])(\s)/g, "$2$3") // Fix extra spaces
        .replace(/-\s+/g, "") // Fix split words
        .replace(/[“”]/g, '"') // Normalize quotes
        .replace(/[‘’]/g, "'")
        .replace(/`/g, "\\`") // Escape backticks
        .trim(),
    )
    .filter((line) => line.length > 0)

  let lyricContent = ""

  for (const line of sanitizedLines) {
    const potentialLength = lyricContent.length + line.length + 1

    if (potentialLength > DISCORD_MESSAGE_CHAR_LIMIT - 4) {
      lyricContent += "\n..."
      break
    }

    lyricContent += `${line}\n`
  }

  return lyricContent.trim()
    ? `\`\`\`\n${lyricContent.trim()}\n\`\`\``
    : NO_LYRICS
}

export const Lyric: Command = {
  data: new SlashCommandBuilder()
    .setName(CommandName.Lyric)
    .setDescription("显示歌词"),
  manual: "显示当前播放歌曲的歌词。",
  run: async ({ interaction }) => {
    const queue = requireQueue(interaction)
    if (!queue.currentTrack) throw new BambooError(ErrorKind.NothingPlaying)

    const rawLyric = await netease.getLyrics(songFromTrack(queue.currentTrack))
    if (!rawLyric) {
      await interaction.reply(NO_LYRICS)
      return
    }

    const parsedLyric = parseLrc(rawLyric)
    await interaction.reply(parsedLyric)

    const gptParsedLyric = await Promise.race([
      getGptParsedLyric(rawLyric, parsedLyric),
      new Promise<string>((_, reject) =>
        setTimeout(
          () => reject(new Error("API timeout after 15 minutes")),
          900000,
        ),
      ),
    ]).catch((error: unknown) => {
      logger.warn(`Lyric tidy-up failed: ${String(error)}`)
      return null
    })
    if (gptParsedLyric !== null) await interaction.editReply(gptParsedLyric)
  },
}
