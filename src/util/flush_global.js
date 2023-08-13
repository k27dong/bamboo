require("dotenv").config()
const { REST, Routes } = require("discord.js")

const rest = new REST().setToken(process.env.TOKEN)

// remove guild-based commands
rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.DEV_GUILD), { body: [] })
.then(() => console.log('Successfully deleted all guild commands.'))
.catch(console.error);

// remove global commands
rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] })
.then(() => console.log('Successfully deleted all application commands.'))
.catch(console.error);