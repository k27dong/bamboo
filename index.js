const fs = require("fs")
const { token, dev_guild, phone, country, pwd } = require("./config.json")
const { Client, Collection, Intents } = require("discord.js")
const { post_server_list_update } = require("./src/helper")
const { internal_login } = require("./src/api/netease/internal_login")

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES],
})

client.commands = new Collection()
client.queue = new Map()
client.cookie = undefined

/** refresh command list  */
const guild = client.guilds.cache.get(dev_guild)
client.commands.set([])
if (!!guild) guild.commands.set([])

/** login */
internal_login(phone, country, pwd).then((res) => {
  if (!!res) client.cookie = res.cookie
})

console.log(client.cookie)

client.on("guildCreate", (guild) => {
  post_server_list_update(guild)
})

const command_files = fs
  .readdirSync("./src/commands")
  .filter((f) => f.endsWith(".js"))

const event_files = fs
  .readdirSync("./src/events")
  .filter((f) => f.endsWith(".js"))

for (const f of command_files) {
  const command = require(`./src/commands/${f}`)
  client.commands.set(command.data.name, command)

  console.log(command.data.name)
}

for (const f of event_files) {
  const event = require(`./src/events/${f}`)

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => event.execute(...args))
  }
}

client.login(token)
