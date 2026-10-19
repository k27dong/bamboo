import { SlashCommandBuilder } from "discord.js"

import { type Command, CommandName } from "./command"

export const Ping: Command = {
  data: new SlashCommandBuilder()
    .setName(CommandName.Ping)
    .setDescription("replies with Pong!"),
  run: async ({ interaction }) => {
    await interaction.reply(
      `Pong! The latency is ${interaction.client.ws.ping}ms`,
    )
  },
}
