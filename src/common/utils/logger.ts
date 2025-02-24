import chalk from "chalk"
import type { CommandInteraction, VoiceBasedChannel } from "discord.js"

import type { Command } from "@/core/commands/Command"

const COMMAND_NAME_LENGTH = 7
const FALLBACK_TIMESTAMP = chalk.grey(`[00:00:00]`)
const MAX_TITLE_LENGTH = 100

// Memoize timestamp generation for same-second calls
let lastTimestamp: { time: string; value: string } = { time: "", value: "" }

const getTimestamp = () => {
  try {
    const now = new Date()
    const timeString = now.toLocaleTimeString("en-CA", {
      hour12: false,
      timeZone: "America/Toronto",
    })

    if (lastTimestamp.time !== timeString) {
      lastTimestamp = {
        time: timeString,
        value: chalk.grey(`[${timeString}]`),
      }
    }
    return lastTimestamp.value
  } catch {
    return FALLBACK_TIMESTAMP
  }
}

const getSafeValue = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") return value.slice(0, 200)
  if (typeof value === "number") return String(value)
  return fallback
}

const isValidInteraction = (
  interaction: unknown,
): interaction is CommandInteraction => {
  return Boolean(
    interaction &&
      typeof interaction === "object" &&
      "commandName" in interaction &&
      "options" in interaction &&
      "user" in interaction,
  )
}

const safeJoin = (...parts: (string | undefined)[]): string =>
  parts.filter(Boolean).join(" ")

export const logger = {
  info(interaction: CommandInteraction) {
    try {
      if (!isValidInteraction(interaction)) {
        console.error("Invalid interaction object")
        return
      }

      const timestamp = getTimestamp()
      const commandName = getSafeValue(
        interaction.commandName,
        "unknown",
      ).padEnd(COMMAND_NAME_LENGTH)

      const username = getSafeValue(interaction.user?.tag, "unknown-user")
      const guildName =
        interaction.guild?.name?.slice(0, 50) || "Direct Message"
      const query = interaction.options?.data?.[0]?.value

      const safeQuery = query
        ? `: ${chalk.yellowBright(getSafeValue(query))}`
        : ""

      console.log(
        safeJoin(
          timestamp,
          chalk.cyanBright(commandName),
          "|",
          chalk.blueBright(username),
          "in",
          chalk.greenBright(guildName),
          safeQuery,
        ),
      )
    } catch (error) {
      console.error("Logger info failed:", error)
    }
  },

  error(interaction: CommandInteraction, command: Command, error: unknown) {
    try {
      if (!isValidInteraction(interaction)) return

      const timestamp = getTimestamp()
      const commandName = getSafeValue(command?.name, "unknown-command")
      const query = interaction.options?.data?.[0]?.value

      const safeQuery = query
        ? chalk.yellowBright(`"${getSafeValue(query)}"`)
        : ""
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error"

      console.error(
        safeJoin(
          timestamp,
          chalk.redBright("❌ERROR"),
          "|",
          chalk.cyanBright(commandName),
          safeQuery,
          "-",
          errorMessage,
        ),
      )

      if (error instanceof Error && error.stack) {
        console.error("Stack trace:", error.stack)
      }
    } catch (loggerError) {
      console.error("Logger error failed:", loggerError)
    }
  },

  player(channel: VoiceBasedChannel | null, title: string) {
    try {
      const timestamp = getTimestamp()
      const safeTitle = getSafeValue(title, "Untitled").slice(
        0,
        MAX_TITLE_LENGTH,
      )

      const guildName = channel?.guild?.name?.slice(0, 50) || "Direct Message"
      const channelName = channel?.name?.slice(0, 30) || "Unknown channel"

      console.log(
        safeJoin(
          timestamp,
          chalk.magentaBright("PLAYER"),
          " |",
          chalk.greenBright(`${guildName} (${channelName})`),
          "-",
          chalk.yellowBright(safeTitle),
        ),
      )
    } catch (error) {
      console.error("Logger player failed:", error)
    }
  },
}
