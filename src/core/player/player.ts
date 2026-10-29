import type { Client, TextBasedChannel } from "discord.js"
import { type GuildNodeCreateOptions, Player } from "discord-player"

import { QUEUE_LEAVE_ON_END_MS, QUEUE_VOLUME } from "@/common/constants"
import type { QueueMetadata } from "@/common/types"

export const createPlayer = (client: Client) =>
  new Player(client, { queryCache: null })

export const queueOptions = (
  channel: TextBasedChannel | null,
): GuildNodeCreateOptions<QueueMetadata> => ({
  metadata: { channel: channel?.isSendable() ? channel : null },
  volume: QUEUE_VOLUME,
  leaveOnEndCooldown: QUEUE_LEAVE_ON_END_MS,
})
