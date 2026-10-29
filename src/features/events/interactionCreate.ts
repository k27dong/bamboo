import { type Client, Events } from "discord.js"

import { dispatch } from "@/core/commands/dispatch"

import { commands } from "../commands"

export default (client: Client) => {
  client.on(Events.InteractionCreate, (interaction) => {
    if (!interaction.isChatInputCommand()) return

    const command = commands.find(
      ({ data }) => data.name === interaction.commandName,
    )

    if (command) void dispatch(command, interaction)
  })
}
