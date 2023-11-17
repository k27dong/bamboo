require("dotenv").config()
const fs = require("node:fs")
const path = require("node:path")
const { Client, GatewayIntentBits, Collection, Routes } = require("discord.js")
const { login_qrcode } = require("./src/api/login_qrcode")
const { alive } = require("./src/util/keep_alive")
const { Player } = require("discord-player")
const NeteaseExtractor = require("./src/extractor/NeteaseExtractor")

const commands_path = path.join(__dirname, "./src/commands")
const bot_events_path = path.join(__dirname, "./src/events/bot")
const player_events_path = path.join(__dirname, "./src/events/player")

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
})
client.commands = new Collection()
client.queue = new Map()
client.cookie = undefined
client.support_server_id = process.env.SUPPORT_SERVER_ID
client.support_channel_id = process.env.SUPPORT_CHANNEL_ID
process.env["FFMPEG_PATH"] = "C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe"

const player = new Player(client)
;(async () => {
  await player.extractors.loadDefault()
  await player.extractors.register(NeteaseExtractor, {})
})()

/* load commands */
for (const file of fs
  .readdirSync(commands_path)
  .filter((file) => file.endsWith(".js"))) {
  const command = require(path.join(commands_path, file))

  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command)
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
    )
  }
}

// load bot events
for (const file of fs
  .readdirSync(bot_events_path)
  .filter((file) => file.endsWith(".js"))) {
  const event = require(path.join(bot_events_path, file))
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => event.execute(...args))
  }
}

// load player events
for (const file of fs
  .readdirSync(player_events_path)
  .filter((file) => file.endsWith(".js"))) {
  const event = require(path.join(player_events_path, file))
  client.on(event.name, (...args) => event.execute(...args))
}

// login_qrcode().then((res) => {
//   if (!res) {
//     console.log("running without logging in")
//   }
//   else {
//     client.cookie = res
//     console.log("Netease logged in!")
//   }
// })

client.login(process.env.TOKEN).then(() => {
  console.log("Discord logged in!")
  alive()
})
