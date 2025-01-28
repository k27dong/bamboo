import type { TextChannel } from "discord.js"
import {
  type GuildQueue,
  GuildQueueEvent,
  type Player,
  type Track,
} from "discord-player"

export default (player: Player) => {
  player.events.on(
    GuildQueueEvent.PlayerStart,
    async (queue: GuildQueue, track: Track) => {
      const { channel } = queue.metadata as { channel: TextChannel }

      await channel.send(`🎶 Now playing: **${track.title}**`)
    },
  )
}
