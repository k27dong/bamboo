import chalk from "chalk"
import type { ChildProcess } from "child_process"
import { ShardingManager } from "discord.js"
import os from "os"
import path from "path"
import { fileURLToPath } from "url"

import { ENVIROMENT, TOKEN } from "@/common/utils/config"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const botScript = path.join(__dirname, "Bamboo.js")

const manager = new ShardingManager(botScript, {
  token: TOKEN,
  totalShards: "auto",
  mode: "process",
  respawn: true,
})

// Attach event listeners before spawning to catch shard 0 events
manager.on("shardCreate", (shard) => {
  console.log(`${chalk.green("[MANAGER]")} Launching shard ${chalk.bold(shard.id)}...`)

  shard.on("ready", () => {
    console.log(
      `${chalk.green("[SHARD]")} Shard ${chalk.bold(shard.id)} is ready (PID: ${shard.process?.pid})`
    )
  })

  shard.on("disconnect", () => {
    console.warn(`${chalk.yellow("[SHARD]")} Shard ${chalk.bold(shard.id)} disconnected`)
  })

  shard.on("reconnecting", () => {
    console.log(`${chalk.blue("[SHARD]")} Shard ${chalk.bold(shard.id)} is reconnecting...`)
  })

  shard.on("death", (process) => {
    const child = process as ChildProcess
    console.error(
      `${chalk.red("[SHARD]")} Shard ${chalk.bold(shard.id)} died (exit: ${child.exitCode}, signal: ${child.signalCode})`
    )
  })

  shard.on("error", (error) => {
    console.error(`${chalk.red("[SHARD]")} Shard ${chalk.bold(shard.id)} error:`, error)
  })
})

manager
  .spawn({
    delay: 5500, // Prevents hitting the identify rate limit
    timeout: 30000,
  })
  .then((shards) => {
    console.log(
      `${chalk.magenta("[MANAGER]")} All ${shards.size} shard(s) spawned in ${ENVIROMENT} mode`
    )

    const cpuCount = os.cpus().length
    if (shards.size < cpuCount) {
      console.log(
        `${chalk.yellow("[INFO]")} Running ${shards.size} shard(s) on ${cpuCount} CPU cores`
      )
    }
  })
  .catch((error) => {
    console.error(`${chalk.red("[MANAGER]")} Failed to spawn shards:`, error)
    process.exit(1)
  })

// Graceful shutdown handler
const shutdown = (signal: string) => {
  console.log(`\n${chalk.yellow("[MANAGER]")} Received ${signal}, shutting down shards...`)
  manager.shards.forEach((shard) => shard.kill())
  process.exit(0)
}

process.on("SIGINT", () => shutdown("SIGINT"))
process.on("SIGTERM", () => shutdown("SIGTERM"))
