import { SlashCommandBuilder } from "discord.js"
import type { Track } from "discord-player"

import { DISCORD_MESSAGE_CHAR_LIMIT } from "@/constants"
import { durationStringToSeconds, secondsToHumanDuration } from "@/format"

import { type Command, CommandName } from "./command"
import { requireQueue } from "./guards"

const trackAt = (tracks: Track[], index: number): Track => {
  const track = tracks[index]
  if (!track) throw new Error(`The queue has no track at ${index}`)
  return track
}

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

  for (const [i, { title, author }] of displayedTracks.entries()) {
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
  data: new SlashCommandBuilder()
    .setName(CommandName.Queue)
    .setDescription("显示播放队列"),
  manual: "显示当前的播放列表。",
  run: async ({ interaction }) => {
    const queue = requireQueue(interaction)

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
        displayedTracks.push(trackAt(upcomingTracks, upcomingPtr))
        upcomingPtr++
        remaining--
        ratioBalance += backRatio
      }

      if (ratioBalance >= 1 && historyPtr >= 0) {
        const historyTrack = trackAt(
          historyTracks,
          historyTracks.length - 1 - historyPtr,
        )
        displayedTracks.unshift(historyTrack)
        startPosition--
        historyPtr--
        remaining--
        ratioBalance--
      }

      if (upcomingPtr >= upcomingTracks.length && remaining > 0) {
        while (remaining > 0 && historyPtr >= 0) {
          const historyTrack = trackAt(
            historyTracks,
            historyTracks.length - 1 - historyPtr,
          )
          displayedTracks.unshift(historyTrack)
          startPosition--
          historyPtr--
          remaining--
        }
      } else if (historyPtr < 0 && remaining > 0) {
        while (remaining > 0 && upcomingPtr < upcomingTracks.length) {
          displayedTracks.push(trackAt(upcomingTracks, upcomingPtr))
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
  },
}
