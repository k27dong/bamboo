const fs = require("fs")
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const { client_id, token, dev_guild } = require("../config.json")

const commands = []
const command_files = fs
  .readdirSync("./src/commands")
  .filter((f) => f.endsWith(".js"))

for (const f of command_files) {
  const command = require(`./src/commands/${f}`)
  commands.push(command.data.toJSON())
}

const rest = new REST({ version: "9" }).setToken(token)

;(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(client_id, dev_guild),
      // Routes.applicationCommands(client_id),
      { body: commands }
    )
  } catch (error) {
    console.error(error)
  }
})()
