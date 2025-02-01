import {
  type Client,
  type CommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js"
import { useMainPlayer, useQueue } from "discord-player"

import {
  DISCORD_MESSAGE_CHAR_LIMIT,
  EXTRACTOR_IDENTIFIER,
  ExtractorSearchType,
} from "@/common/constants"
import type { Command } from "@/core/commands/Command"

const parseLrc = (lrc: string | null | undefined): string => {
  if (!lrc) {
    return "```\nNo lyrics available\n```"
  }

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
    : "```\nNo lyrics available\n```"
}

const LyricOption = new SlashCommandBuilder()
  .setName("lyric")
  .setDescription("显示歌词")

export const Lyric: Command = {
  name: LyricOption.name,
  description: LyricOption.description,
  data: LyricOption,
  run: async (client: Client, interaction: CommandInteraction) => {
    try {
      const player = useMainPlayer()
      const queue = useQueue(interaction.guild!)!

      if (!queue) {
        await interaction.reply("Queue not found!")
        return
      }

      if (!queue.currentTrack) {
        await interaction.reply("No track is currently playing!")
        return
      }

      const trackId = queue.currentTrack.url

      const lrcResult = await player.search(trackId, {
        requestedBy: interaction.user,
        searchEngine: `ext:${EXTRACTOR_IDENTIFIER}`,
        requestOptions: {
          searchType: ExtractorSearchType.Lyric,
        },
      })

      console.log(lrcResult.tracks[0].title)

      await interaction.reply(parseLrc(lrcResult.tracks[0].title))
    } catch (error: any) {
      console.error(`❌ Error in ${Lyric.name} command:`, error)
      await interaction.followUp({
        content: `❌ **Error**\n\`\`\`${error}\`\`\``,
        flags: MessageFlags.Ephemeral,
      })
    }
  },
}
