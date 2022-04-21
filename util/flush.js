/**
 * A helper script that cleans all exisiting slash commands
 */

const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const { client_id, token, dev_guild } = require("../config.json")

const rest = new REST({ version: "9" }).setToken(token)

let guild_promises = []
let server_promises = []

rest.get(Routes.applicationGuildCommands(client_id, dev_guild)).then((data) => {
  for (const command of data) {
    const deleteUrl = `${Routes.applicationGuildCommands(
      client_id,
      dev_guild
    )}/${command.id}`
    guild_promises.push(rest.delete(deleteUrl))
  }
})

rest.get(Routes.applicationCommands(client_id)).then((data) => {
  for (const command of data) {
    const deleteUrl = `${Routes.applicationCommands(client_id)}/${command.id}`
    server_promises.push(rest.delete(deleteUrl))
  }
})

Promise.all([guild_promises, server_promises])
  .then(() => {
    console.log("doing ... ")
  })
  .catch((err) => {
    console.error(err)
  })
  .finally(() => {
    console.log("done")
  })
