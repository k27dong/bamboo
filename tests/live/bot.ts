import { spawn } from "node:child_process"
import { setTimeout as sleep } from "node:timers/promises"

import { ChannelType, Client, Events, GatewayIntentBits } from "discord.js"
import { GuildQueueEvent, Player } from "discord-player"

import { ApiServiceType } from "@/common/constants"
import { DEV_GUILD, TOKEN } from "@/common/utils/config"
import { setUpCookie } from "@/common/utils/cookie"
import { BambooExtractor } from "@/core/extractor/BambooExtractor"

const QUERY = "海阔天空"
const PLAY_MS = 10_000
const READY_LINE = "Bamboo On"

const voiceChannelId = process.env.DEV_VOICE_CHANNEL_ID
if (!voiceChannelId) {
  console.error("Set DEV_VOICE_CHANNEL_ID to the voice channel to play in.")
  process.exit(1)
}

let failures = 0
const check = (name: string, passed: boolean, detail: string) => {
  if (!passed) failures++
  console.log(`${passed ? "PASS" : "FAIL"}  ${name}  ${detail}`)
}

const boot = await new Promise<{ ready: boolean; exitCode: number | null }>(
  (resolve) => {
    const bot = spawn("node", ["dist/sharding.js"])
    let output = ""
    let ready = false
    const giveUp = setTimeout(() => bot.kill("SIGTERM"), 60_000)
    const onOutput = (chunk: Buffer) => {
      output += chunk.toString()
      if (!ready && output.includes(READY_LINE)) {
        ready = true
        bot.kill("SIGTERM")
      }
    }
    bot.stdout.on("data", onOutput)
    bot.stderr.on("data", onOutput)
    bot.on("exit", (exitCode) => {
      clearTimeout(giveUp)
      resolve({ ready, exitCode })
    })
  },
)
check("built bot starts and reports ready", boot.ready, "dist/sharding.js")
check("built bot stops cleanly", boot.exitCode === 0, `exit=${boot.exitCode}`)

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
})
const player = new Player(client)
const errors: string[] = []
let started = false
player.events.on(GuildQueueEvent.PlayerStart, () => {
  started = true
})
player.events.on(GuildQueueEvent.PlayerError, (_queue, error) => {
  errors.push(error.message)
})
player.events.on(GuildQueueEvent.Error, (_queue, error) => {
  errors.push(error.message)
})

await player.extractors.register(BambooExtractor, {
  cookies: {
    [ApiServiceType.Netease]: await setUpCookie(ApiServiceType.Netease),
  },
})

const ready = new Promise<void>((resolve) => {
  client.once(Events.ClientReady, () => {
    resolve()
  })
})
await client.login(TOKEN)
await ready

const guild = await client.guilds.fetch(DEV_GUILD)
const channel = await guild.channels.fetch(voiceChannelId)
if (channel?.type !== ChannelType.GuildVoice) {
  console.error(`${voiceChannelId} is not a voice channel in ${guild.name}.`)
  process.exit(1)
}

const { track } = await player.play(channel, QUERY, {
  nodeOptions: { volume: 10, leaveOnEnd: false },
})
check("song resolves", !!track.url, `${track.title} by ${track.author}`)

let streamedMs = 0
const deadline = Date.now() + 3 * PLAY_MS
while (Date.now() < deadline && streamedMs < PLAY_MS && errors.length === 0) {
  await sleep(1000)
  streamedMs =
    player.nodes.get(guild.id)?.node.getTimestamp()?.current.value ?? 0
}
check("playback starts", started, `in ${channel.name}`)
check("audio keeps streaming", streamedMs >= PLAY_MS, `${streamedMs}ms`)
check("no player errors", errors.length === 0, errors.join("; ") || "none")

player.nodes.get(guild.id)?.delete()
await client.destroy()

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILED`)
process.exit(failures === 0 ? 0 : 1)
