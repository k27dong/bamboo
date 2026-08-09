import {
  type ChatInputCommandInteraction,
  type Client,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js"
import { type Track, useQueue } from "discord-player"

import { DISCORD_MESSAGE_CHAR_LIMIT } from "@/common/constants"
import {
  durationStringToSeconds,
  secondsToHumanDuration,
} from "@/common/utils/common"
import { logger } from "@/common/utils/logger"
import type { Command } from "@/core/commands/Command"

const QueueOption = new SlashCommandBuilder()
  .setName("queue")
  .setDescription("显示播放队列")

const formatQueueMessage = (
  displayedTracks: Track[],
  currentIndex: number,
  startPosition: number,
  totalDuration: string,
  totalQueueLength: number,
): string => {
  if (!displayedTracks.length) return "```Track empty!```"

  const reservedSpace = 35
  const durationLine = `\n总时长: ${totalDuration}`
  let remainingTracks = 0
  const lines: string[] = []

  for (let i = 0; i < displayedTracks.length; i++) {
    const { title, author } = displayedTracks[i]
    const isCurrent = i === currentIndex ? "   ◄———— \n" : "\n"
    const queuePosition = startPosition + i + 1
    const currLine = `${queuePosition}) ${title} ${author ? `(${author})` : ""} ${isCurrent}`

    const currentLength = lines.join("").length
    if (
      currentLength + currLine.length + reservedSpace >=
      DISCORD_MESSAGE_CHAR_LIMIT
    ) {
      remainingTracks = totalQueueLength - (startPosition + i + 1)
      lines.push(`${queuePosition}) ... (${remainingTracks} more)\n`)
      break
    }

    lines.push(currLine)
  }

  if (remainingTracks === 0) {
    remainingTracks =
      totalQueueLength - (startPosition + displayedTracks.length)
  }

  if (remainingTracks > 0) {
    lines.push(`\n... (${remainingTracks} more)`)
  }

  const queueMessage = lines.join("")

  if (
    queueMessage.length + durationLine.length + 6 <=
    DISCORD_MESSAGE_CHAR_LIMIT
  ) {
    return `\`\`\`${queueMessage}${durationLine}\`\`\``
  }

  return `\`\`\`${queueMessage}\`\`\``
}

export const Queue: Command = {
  name: QueueOption.name,
  description: QueueOption.description,
  data: QueueOption,
  manual: "显示当前的播放列表。",
  run: async (client: Client, interaction: ChatInputCommandInteraction) => {
    try {
      const queue = useQueue(interaction.guild!)!

      if (!queue) {
        await interaction.reply({
          content: "Queue not found!",
          flags: MessageFlags.Ephemeral,
        })
        return
      }

      if (!queue.currentTrack) {
        await interaction.reply("```Track empty!```")
        return
      }

      const currentTrack = queue.currentTrack
      const upcomingTracks = queue.tracks.data
      const historyTracks = queue.history.tracks.data

      const totalQueueLength = historyTracks.length + 1 + upcomingTracks.length
      const totalDuration = secondsToHumanDuration(
        upcomingTracks.reduce(
          (acc, track) => acc + durationStringToSeconds(track.duration),
          0,
        ),
      )

      const displayedTracks: Track[] = [currentTrack]
      const backRatio = 0.3
      let remaining = 29

      let startPosition = historyTracks.length
      let historyPtr = historyTracks.length - 1
      let upcomingPtr = 0
      let ratioBalance = 0

      while (
        remaining > 0 &&
        (historyPtr >= 0 || upcomingPtr < upcomingTracks.length)
      ) {
        if (upcomingPtr < upcomingTracks.length) {
          displayedTracks.push(upcomingTracks[upcomingPtr])
          upcomingPtr++
          remaining--
          ratioBalance += backRatio
        }

        if (ratioBalance >= 1 && historyPtr >= 0) {
          const historyTrack =
            historyTracks[historyTracks.length - 1 - historyPtr]
          displayedTracks.unshift(historyTrack)
          startPosition--
          historyPtr--
          remaining--
          ratioBalance--
        }

        if (upcomingPtr >= upcomingTracks.length && remaining > 0) {
          while (remaining > 0 && historyPtr >= 0) {
            const historyTrack =
              historyTracks[historyTracks.length - 1 - historyPtr]
            displayedTracks.unshift(historyTrack)
            startPosition--
            historyPtr--
            remaining--
          }
        } else if (historyPtr < 0 && remaining > 0) {
          while (remaining > 0 && upcomingPtr < upcomingTracks.length) {
            displayedTracks.push(upcomingTracks[upcomingPtr])
            upcomingPtr++
            remaining--
          }
        }
      }

      const currentIndex = displayedTracks.indexOf(currentTrack)

      await interaction.reply(
        formatQueueMessage(
          displayedTracks,
          currentIndex,
          startPosition,
          totalDuration,
          totalQueueLength,
        ),
      )
    } catch (error: any) {
      logger.error(interaction, Queue, error)

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
