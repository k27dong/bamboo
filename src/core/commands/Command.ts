import type {
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js"

export interface Command extends ChatInputApplicationCommandData {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder
  run: (client: Client, interaction: ChatInputCommandInteraction) => Promise<void>
  manual?: string
}
