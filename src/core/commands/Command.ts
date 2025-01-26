import type {
  ChatInputApplicationCommandData,
  Client,
  CommandInteraction,
  ContextMenuCommandInteraction,
} from "discord.js"

export interface Command extends ChatInputApplicationCommandData {
  run: (
    client: Client,
    interaction: CommandInteraction | ContextMenuCommandInteraction,
  ) => void | Promise<void>
}
