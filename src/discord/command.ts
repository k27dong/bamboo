import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js"

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

export const HELP_HIDDEN_COMMANDS: readonly string[] = [
  CommandName.Sudo,
  CommandName.Help,
  CommandName.Ping,
]

export const DEPLOY_SKIPPED_COMMANDS: readonly string[] = [CommandName.Sudo]
