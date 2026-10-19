import type { Client, SendableChannels, TextBasedChannel } from "discord.js"
import { type GuildNodeCreateOptions, Player } from "discord-player"

import { QUEUE_LEAVE_ON_END_MS, QUEUE_VOLUME } from "@/constants"

export type QueueMetadata = { channel: SendableChannels }

export const createPlayer = (client: Client) =>
  new Player(client, { queryCache: null })

export const queueOptions = (
  channel: TextBasedChannel | null,
): GuildNodeCreateOptions<QueueMetadata> => {
  if (!channel?.isSendable()) {
    throw new Error("The command's channel cannot receive messages")
  }
  return {
    metadata: { channel },
    volume: QUEUE_VOLUME,
    leaveOnEndCooldown: QUEUE_LEAVE_ON_END_MS,
  }
}
