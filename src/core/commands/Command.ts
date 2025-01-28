import type {
  ChatInputApplicationCommandData,
  Client,
  CommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js"

export interface Command extends ChatInputApplicationCommandData {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder
  run: (client: Client, interaction: CommandInteraction) => void | Promise<void>
}
