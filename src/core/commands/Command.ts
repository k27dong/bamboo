import type {
  ChatInputApplicationCommandData,
  Client,
  CommandInteraction,
  ContextMenuCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js"

export interface Command extends ChatInputApplicationCommandData {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder
  run: (
    client: Client,
    interaction: CommandInteraction | ContextMenuCommandInteraction,
  ) => void | Promise<void>
}
