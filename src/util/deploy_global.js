require("dotenv").config()
const fs = require("node:fs")
const path = require("node:path")
const { REST, Routes } = require("discord.js")

const rest = new REST().setToken(process.env.TOKEN)
const commands = []
const command_path = path.join(__dirname, "../commands")
const command_files = fs
  .readdirSync(command_path)
  .filter((file) => file.endsWith(".js"))

for (const file of command_files) {
  const file_path = path.join(command_path, file)
  const command = require(file_path)
  if ("data" in command && "execute" in command) {
    commands.push(command.data.toJSON())
  } else {
    console.log(
      `[WARNING] The command at ${file_path} is missing a required "data" or "execute" property.`,
    )
  }
}

;(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`,
    )

    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      {
        body: commands,
      },
    )

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`,
    )
  } catch (err) {
    console.error(err)
  }
})()
