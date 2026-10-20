import {
  type GuildQueue,
  GuildQueueEvent,
  type Player,
  QueueRepeatMode,
  type Track,
  TrackSkipReason,
} from "discord-player"

import { logger } from "@/common/utils/logger"

export default (player: Player) => {
  player.events.on(
    GuildQueueEvent.PlayerSkip,
    (queue: GuildQueue, track: Track, reason: TrackSkipReason) => {
      const lastSongCantPlay =
        reason === TrackSkipReason.NoStream &&
        track === queue.currentTrack &&
        queue.tracks.size === 0
      const looping =
        queue.repeatMode === QueueRepeatMode.TRACK ||
        queue.repeatMode === QueueRepeatMode.QUEUE

      if (lastSongCantPlay && looping) {
        queue.setRepeatMode(QueueRepeatMode.OFF)
        logger.warn(`Turned loop off because ${track.title} can't play`)
      }
    },
  )
}
