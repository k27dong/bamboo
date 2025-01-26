import { SlashCommandBuilder } from "discord.js"

import type { Command } from "@/core/commands/Command"

import { Ping } from "./ping"

const commands: Command[] = [Ping]

export const Commands = commands.map((command) => {
  const builder = new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description)

  if (command.name === "sudo") {
    console.log("Sudo command detected")
  }

  return {
    ...command,
    data: builder,
  }
})
