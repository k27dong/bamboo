import { EmbedBuilder } from "discord.js"
import type { Track } from "discord-player"

import { APP, APPLINK, EmbedColors, ICONLINK } from "@/common/constants"

export const ErrorMessage = (message: string) => {
  return new EmbedBuilder()
    .setTitle("Error")
    .setDescription(message)
    .setColor(EmbedColors.Error)
    .setFooter({
      text: APP,
      iconURL: ICONLINK,
    })
    .setTimestamp()
}

export const NowPlayingMessage = (track: Track) => {
  return new EmbedBuilder()
    .setAuthor({
      name: "Now Playing",
      url: APPLINK,
      iconURL: ICONLINK,
    })
    .setTitle(track.cleanTitle)
    .setDescription(`${track.author}\t(${track.duration})`)
    .setThumbnail(track.thumbnail)
    .setColor(EmbedColors.Playing)
}
