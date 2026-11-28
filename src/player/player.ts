import type { Client, SendableChannels, TextBasedChannel } from "discord.js"
import { type GuildNodeCreateOptions, Player } from "discord-player"

import { QUEUE_LEAVE_ON_END_MS } from "@/shared/constants"

export interface QueueMetadata {
  channel: SendableChannels | null
}

export const createPlayer = (client: Client) =>
  new Player(client, { queryCache: null })

export const queueOptions = (
  channel: TextBasedChannel | null,
): GuildNodeCreateOptions<QueueMetadata> => ({
  metadata: { channel: channel?.isSendable() ? channel : null },
  leaveOnEndCooldown: QUEUE_LEAVE_ON_END_MS,
  onAfterCreateStream: () => Promise.resolve(null), // the default hook marks every stream as PCM; null keeps the Opus type
  // discord-player forwards ffmpeg's Opus untouched only when every stage is off
  disableVolume: true,
  disableEqualizer: true,
  disableFilterer: true,
  disableBiquad: true,
  disableResampler: true,
  disableCompressor: true,
  disableReverb: true,
  disableSeeker: true,
})
