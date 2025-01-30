import {
  type Client,
  type CommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js"
import { type Track, useQueue } from "discord-player"

import { DISCORD_MESSAGE_CHAR_LIMIT } from "@/common/constants"
import type { Command } from "@/core/commands/Command"

const QueueOption = new SlashCommandBuilder()
  .setName("queue")
  .setDescription("显示播放队列")

const formatQueueMessage = (
  tracks: Track[],
  currentIndex: number,
  startPosition: number,
): string => {
  if (!tracks.length) return "```Track empty!```"

  let queueMessage = ""
  const maxLength = DISCORD_MESSAGE_CHAR_LIMIT

  for (let i = 0; i < tracks.length; i++) {
    const { title, author, duration } = tracks[i]
    const isCurrent = i === currentIndex ? "   ◄———— \n" : "\n"
    const queuePosition = startPosition + i + 1
    const currLine = `${queuePosition}) ${title} ${author ? `(${author})` : ""} [${duration}] ${isCurrent}`

    if (queueMessage.length + currLine.length >= maxLength) {
      queueMessage += `${queuePosition}) ...\n`
      break
    }

    queueMessage += currLine
  }

  return `\`\`\`${queueMessage}\`\`\``
}

export const Queue: Command = {
  name: QueueOption.name,
  description: QueueOption.description,
  data: QueueOption,
  run: async (client: Client, interaction: CommandInteraction) => {
    try {
      const queue = useQueue(interaction.guild!)!

      if (!queue) {
        await interaction.reply({
          content: "Queue not found!",
          flags: MessageFlags.Ephemeral
        })
      }

      if (!queue.currentTrack) {
        await interaction.reply("```Track empty!```")
        return
      }

      const currentTrack = queue.currentTrack
      const upcomingTracks = queue.tracks.data
      const historyTracks = queue.history.tracks.data

      const displayedTracks: Track[] = [currentTrack]
      const backRatio = 0.3
      let remaining = 22

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
          displayedTracks.unshift(historyTracks[historyPtr])
          startPosition--
          historyPtr--
          remaining--
          ratioBalance--
        }

        if (upcomingPtr >= upcomingTracks.length && remaining > 0) {
          while (remaining > 0 && historyPtr >= 0) {
            displayedTracks.unshift(historyTracks[historyPtr])
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
        formatQueueMessage(displayedTracks, currentIndex, startPosition),
      )
    } catch (error) {
      console.error(`❌ Error in ${Queue.name} command:`, error)
    }
  },
}
