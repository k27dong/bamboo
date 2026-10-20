import type {
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js"

export interface LegacyCommand extends ChatInputApplicationCommandData {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder
  run: (
    client: Client,
    interaction: ChatInputCommandInteraction,
  ) => Promise<void>
  manual?: string
}

export enum CommandName {
  Ping = "ping",
  Play = "play",
  Queue = "queue",
  Skip = "skip",
  Album = "album",
  Lyric = "lyric",
  User = "user",
  Shuffle = "shuffle",
  Jump = "jump",
  Clear = "clear",
  Exit = "exit",
  Back = "back",
  Sudo = "sudo",
  Help = "help",
  Pause = "pause",
  Loop = "loop",
}

export type CommandContext = { interaction: ChatInputCommandInteraction }

export interface Command {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder
  manual?: string
  run(context: CommandContext): Promise<void>
}
