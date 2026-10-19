import { inspect } from "node:util"

import chalk, { type ChalkInstance } from "chalk"
import type { ChatInputCommandInteraction, VoiceBasedChannel } from "discord.js"

import { LOG_COMMAND_WIDTH, LOG_LEVEL_WIDTH, LOG_TIME_ZONE } from "@/constants"
import { request } from "@/context"

enum Level {
  Info = "info",
  Warn = "warn",
  Error = "error",
}

const LEVEL_COLORS: Record<Level, ChalkInstance> = {
  [Level.Info]: chalk.green,
  [Level.Warn]: chalk.yellow,
  [Level.Error]: chalk.redBright,
}

const timestamp = () => {
  const { year, month, day, hour, minute, second } = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: LOG_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts()
      .map(({ type, value }) => [type, value] as const),
  )
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

const line = (level: Level, message: string) =>
  [
    chalk.grey(`[${timestamp()}] [s${process.env.SHARDS ?? 0}]`),
    LEVEL_COLORS[level](level.padEnd(LOG_LEVEL_WIDTH)),
    message,
  ].join(" ")

const column = (label: string, color: ChalkInstance) =>
  `${color(label.padEnd(LOG_COMMAND_WIDTH))} | `

const inRequest = (message: string) => {
  const current = request.getStore()
  return current
    ? `${column(current.command, chalk.cyanBright)}${message}`
    : message
}

const duration = (ms: number) =>
  ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1)} s`

export const logger = {
  info(message: string) {
    console.log(line(Level.Info, inRequest(message)))
  },

  warn(message: string) {
    console.warn(line(Level.Warn, inRequest(message)))
  },

  error(message: string, error?: unknown) {
    console.error(line(Level.Error, inRequest(message)))
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
        Level.Info,
        `${column(interaction.commandName, chalk.cyanBright)}${user} in ${server}${query} (${duration(durationMs)})`,
      ),
    )
  },

  player(channel: VoiceBasedChannel | null, title: string) {
    const server = channel?.guild.name ?? "Direct Message"
    const voice = channel?.name ?? "Unknown channel"
    console.log(
      line(
        Level.Info,
        `${column("PLAYER", chalk.magentaBright)}${chalk.greenBright(`${server} (${voice})`)} - ${chalk.yellowBright(title)}`,
      ),
    )
  },
}
