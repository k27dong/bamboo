import chalk from "chalk"
import type { ChildProcess } from "child_process"
import {
  REST,
  type RESTGetAPIGatewayBotResult,
  Routes,
  ShardingManager,
} from "discord.js"
import os from "os"
import path from "path"
import { setTimeout as sleep } from "timers/promises"
import { fileURLToPath } from "url"

import { config } from "@/shared/config"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const botScript = path.join(__dirname, "shard.js")
const SPARE_SESSION_STARTS = 100 // Discord resets the token of a bot that uses up its daily session starts

const manager = new ShardingManager(botScript, {
  token: config.discord.token,
  totalShards: "auto",
  mode: "process",
  respawn: true,
})

const rest = new REST().setToken(config.discord.token)

const gatewayBot = async () =>
  (await rest.get(Routes.gatewayBot())) as RESTGetAPIGatewayBotResult

const waitForSessionStarts = async () => {
  let gateway = await gatewayBot()
  while (gateway.session_start_limit.remaining <= SPARE_SESSION_STARTS) {
    const { remaining, reset_after } = gateway.session_start_limit
    console.error(
      `${chalk.red("[MANAGER]")} Only ${remaining} Discord logins left today, waiting ${Math.ceil(reset_after / 60_000)} min for them to reset`,
    )
    await sleep(reset_after)
    gateway = await gatewayBot()
  }
  return gateway
}

const stopShards = (code: number) => {
  manager.shards.forEach((shard) => shard.kill())
  process.exit(code)
}

const stopIfSessionStartsRunLow = async () => {
  try {
    const { remaining } = (await gatewayBot()).session_start_limit
    if (remaining > SPARE_SESSION_STARTS) return
    console.error(
      `${chalk.red("[MANAGER]")} Only ${remaining} Discord logins left today, stopping instead of restarting shards`,
    )
  } catch (error) {
    console.error(
      `${chalk.red("[MANAGER]")} Couldn't read how many Discord logins are left, stopping instead of restarting shards:`,
      error,
    )
  }
  stopShards(1)
}

// Attach event listeners before spawning to catch shard 0 events
manager.on("shardCreate", (shard) => {
  console.log(
    `${chalk.green("[MANAGER]")} Launching shard ${chalk.bold(shard.id)}...`,
  )

  shard.on("ready", () => {
    console.log(
      `${chalk.green("[SHARD]")} Shard ${chalk.bold(shard.id)} is ready (PID: ${shard.process?.pid})`,
    )
  })

  shard.on("disconnect", () => {
    console.warn(
      `${chalk.yellow("[SHARD]")} Shard ${chalk.bold(shard.id)} disconnected`,
    )
  })

  shard.on("reconnecting", () => {
    console.log(
      `${chalk.blue("[SHARD]")} Shard ${chalk.bold(shard.id)} is reconnecting...`,
    )
  })

  shard.on("death", (process) => {
    const child = process as ChildProcess
    console.error(
      `${chalk.red("[SHARD]")} Shard ${chalk.bold(shard.id)} died (exit: ${child.exitCode}, signal: ${child.signalCode})`,
    )
    void stopIfSessionStartsRunLow()
  })

  shard.on("error", (error) => {
    console.error(
      `${chalk.red("[SHARD]")} Shard ${chalk.bold(shard.id)} error:`,
      error,
    )
  })
})

const gateway = await waitForSessionStarts()

manager
  .spawn({
    amount: gateway.shards, // "auto" would call /gateway/bot again, which Discord allows only twice every few seconds
    delay: 5500, // Prevents hitting the identify rate limit
    timeout: 30000,
  })
  .then((shards) => {
    console.log(
      `${chalk.magenta("[MANAGER]")} All ${shards.size} shard(s) spawned in ${config.environment} mode`,
    )

    const cpuCount = os.cpus().length
    if (shards.size < cpuCount) {
      console.log(
        `${chalk.yellow("[INFO]")} Running ${shards.size} shard(s) on ${cpuCount} CPU cores`,
      )
    }
  })
  .catch((error) => {
    console.error(`${chalk.red("[MANAGER]")} Failed to spawn shards:`, error)
    process.exit(1)
  })

// Graceful shutdown handler
const shutdown = (signal: string) => {
  console.log(
    `\n${chalk.yellow("[MANAGER]")} Received ${signal}, shutting down shards...`,
  )
  stopShards(0)
}

process.on("SIGINT", () => shutdown("SIGINT"))
process.on("SIGTERM", () => shutdown("SIGTERM"))
