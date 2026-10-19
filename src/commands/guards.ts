import {
  type ChatInputCommandInteraction,
  GuildMember,
  PermissionsBitField,
  type VoiceBasedChannel,
} from "discord.js"
import { type GuildQueue, useQueue } from "discord-player"

import { BambooError, ErrorKind } from "@/errors"
import type { QueueMetadata } from "@/player/player"

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
