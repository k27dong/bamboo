import {
  type CommandInteraction,
  GuildMember,
  PermissionsBitField,
} from "discord.js"

import { ErrorMessage } from "./embedMessages"

export const checkInVoiceChannel = async (interaction: CommandInteraction) => {
  // 1. Check if user is in a voice channel
  if (
    !(interaction.member instanceof GuildMember) ||
    !interaction.member.voice.channel
  ) {
    await interaction.followUp({
      embeds: [ErrorMessage("You need to be in a voice channel.")],
    })
    throw new Error("User not in voice channel.")
  }

  // 2. Check if the bot is player in a difference voice channel
  if (
    interaction.guild?.members.me?.voice.channel &&
    interaction.guild?.members.me?.voice.channel !==
      interaction.member.voice.channel
  ) {
    await interaction.followUp({
      embeds: [ErrorMessage("I am already in a different voice channel.")],
    })
    throw new Error("Bot already in a different voice channel.")
  }

  // 3. Check if the bot has permission to join the voice channel
  if (
    !interaction.guild?.members.me?.permissions.has(
      PermissionsBitField.Flags.Connect,
    )
  ) {
    await interaction.followUp({
      embeds: [
        ErrorMessage("I don't have permission to join your voice channel."),
      ],
    })
    throw new Error("Bot does not have permission to join voice channel")
  }

  // 4. Check if the bot has permission to speak in the voice channel
  if (
    !interaction.guild.members.me
      .permissionsIn(interaction.member.voice.channel)
      .has(PermissionsBitField.Flags.Speak)
  ) {
    await interaction.followUp({
      embeds: [
        ErrorMessage("I don't have permission to speak in your voice channel."),
      ],
    })
    throw new Error("Bot does not have permission to speak in voice channel")
  }
}
