import {
  type ChatInputCommandInteraction,
  GuildMember,
  PermissionsBitField,
  type VoiceBasedChannel,
} from "discord.js"
import { type GuildQueue, useQueue } from "discord-player"

import { BambooError, ErrorKind } from "@/common/errors"
import type { QueueMetadata } from "@/common/types"

import { ErrorMessage } from "./embedMessages"

export const checkInVoiceChannel = async (
  interaction: ChatInputCommandInteraction,
) => {
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

export const requireVoice = (
  interaction: ChatInputCommandInteraction,
): VoiceBasedChannel => {
  const channel =
    interaction.member instanceof GuildMember
      ? interaction.member.voice.channel
      : null
  if (!channel) throw new BambooError(ErrorKind.NotInVoice)

  const me = channel.guild.members.me
  if (me?.voice.channel && me.voice.channel !== channel) {
    throw new BambooError(ErrorKind.OtherVoiceChannel)
  }
  if (!me?.permissions.has(PermissionsBitField.Flags.Connect)) {
    throw new BambooError(ErrorKind.NoConnectPermission)
  }
  if (!me.permissionsIn(channel).has(PermissionsBitField.Flags.Speak)) {
    throw new BambooError(ErrorKind.NoSpeakPermission)
  }
  return channel
}

export const requireQueue = (
  interaction: ChatInputCommandInteraction,
): GuildQueue<QueueMetadata> => {
  const queue = interaction.guild && useQueue<QueueMetadata>(interaction.guild)
  if (!queue) throw new BambooError(ErrorKind.NoSession)
  return queue
}

export const requirePlaying = (
  interaction: ChatInputCommandInteraction,
): GuildQueue<QueueMetadata> => {
  const queue = requireQueue(interaction)
  if (!queue.isPlaying() || !queue.currentTrack) {
    throw new BambooError(ErrorKind.NothingPlaying)
  }
  return queue
}
