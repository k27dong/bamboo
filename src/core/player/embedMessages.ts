import { EmbedBuilder } from "discord.js"
import type { Playlist, Track } from "discord-player"

import { APP, APPLINK, EmbedColors, ICONLINK } from "@/common/constants"
import { timestampToYear } from "@/common/utils/common"

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

export const NowPlayingPlaylistMessage = (playlist: Playlist) => {
  return new EmbedBuilder()
    .setAuthor({
      name: `${playlist.tracks.length} song${playlist.tracks.length > 1 ? "s" : ""} added from album`,
      url: APPLINK,
      iconURL: ICONLINK,
    })
    .setTitle(playlist.title)
    .setImage(playlist.thumbnail)
    .setColor(EmbedColors.Playing)
    .setFooter({
      text: `${playlist.author.name}, ${timestampToYear(parseInt(playlist.author.url, 10))}`,
    })
}
