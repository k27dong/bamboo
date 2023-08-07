require("dotenv").config()
const fs = require("node:fs")
const path = require("node:path")
const { Client, GatewayIntentBits, Collection } = require("discord.js")
const { login_qrcode } = require("./src/api/login_qrcode")

const commands_path = path.join(__dirname, "./src/commands")
const events_path = path.join(__dirname, "./src/events")

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
})
client.commands = new Collection()
client.queue = new Map()
client.cookie = undefined

/* load commands */
for (const file of fs.readdirSync(commands_path).
  filter((file) => file.endsWith(".js"))) {
  const command = require(path.join(commands_path, file))

  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command)
    // console.log(command.data.name)
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
  }
}

/* load events */
for (const file of fs.readdirSync(events_path).
  filter((file) => file.endsWith(".js"))) {
  const event = require(path.join(events_path, file))
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => event.execute(...args))
  }
}

login_qrcode().then((res) => {
  if (!res) {
    console.log("running without logging in")
  }
  client.cookie = res
  console.log("Netease logged in!")
})

client.login(process.env.TOKEN).then(() => {
  console.log("Discord logged in!")
})
