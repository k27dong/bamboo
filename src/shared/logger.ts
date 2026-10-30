import { inspect } from "node:util"

import chalk, { type ChalkInstance } from "chalk"
import type { ChatInputCommandInteraction, VoiceBasedChannel } from "discord.js"

import {
  LOG_COMMAND_WIDTH,
  LOG_LEVEL_COLORS,
  LOG_LEVEL_WIDTH,
  LOG_TIME_FORMAT,
  LogLevel,
} from "./constants"
import { activeRequest } from "./context"

const timestamp = () => {
  const { year, month, day, hour, minute, second } = Object.fromEntries(
    LOG_TIME_FORMAT.formatToParts().map(
      ({ type, value }) => [type, value] as const,
    ),
  )
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

const line = (level: LogLevel, message: string) =>
  [
    chalk.grey(`[${timestamp()}] [s${process.env.SHARDS ?? 0}]`),
    LOG_LEVEL_COLORS[level](level.padEnd(LOG_LEVEL_WIDTH)),
    message,
  ].join(" ")

const column = (label: string, color: ChalkInstance) =>
  `${color(label.padEnd(LOG_COMMAND_WIDTH))} | `

const inRequest = (message: string) => {
  const current = activeRequest()
  if (!current) return message
  const server = chalk.greenBright(current.guildId ?? "DM")
  return `${column(current.command, chalk.cyanBright)}${server} | ${message}`
}

const duration = (ms: number) =>
  ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1)} s`

export const logger = {
  warn(message: string) {
    console.warn(line(LogLevel.Warn, inRequest(message)))
  },

  error(message: string, error?: unknown) {
    console.error(line(LogLevel.Error, inRequest(message)))
    if (error !== undefined) console.error(inspect(error))
  },

  command(interaction: ChatInputCommandInteraction, durationMs: number) {
    const user = chalk.blueBright(interaction.user.tag)
    const server = chalk.greenBright(
      interaction.guild?.name ?? "Direct Message",
    )
    const value = interaction.options.data[0]?.value
    const query = value === undefined ? "" : `: ${chalk.yellowBright(value)}`
    console.log(
      line(
        LogLevel.Info,
        `${column(interaction.commandName, chalk.cyanBright)}${user} in ${server}${query} (${duration(durationMs)})`,
      ),
    )
  },

  player(channel: VoiceBasedChannel | null, title: string) {
    const server = channel?.guild.name ?? "Direct Message"
    const voice = channel?.name ?? "Unknown channel"
    console.log(
      line(
        LogLevel.Info,
        `${column("PLAYER", chalk.magentaBright)}${chalk.greenBright(`${server} (${voice})`)} - ${chalk.yellowBright(title)}`,
      ),
    )
  },
}
