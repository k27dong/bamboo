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

// todo check this syntax
export const NowPlayingUserPlaylistMessage = (playlist: Playlist) => {
  const embed = new EmbedBuilder()
  return [
    (embed: EmbedBuilder) =>
      embed.setAuthor({
        name: `${playlist.tracks.length} song${playlist.tracks.length > 1 ? "s" : ""} added from playlist`,
        url: APPLINK,
        iconURL: ICONLINK,
      }),
    (embed: EmbedBuilder) => embed.setTitle(playlist.title),
    (embed: EmbedBuilder) => embed.setThumbnail(playlist.thumbnail),
    (embed: EmbedBuilder) => embed.setColor(EmbedColors.Playing),
    (embed: EmbedBuilder) =>
      embed.setFooter({
        text: `From ${playlist.author.name}`,
        iconURL: playlist.author.url ?? undefined, // Prevent null
      }),
    (embed: EmbedBuilder) =>
      playlist.description?.trim()
        ? embed.setDescription(playlist.description)
        : embed,
  ].reduce((embed, apply) => apply(embed), embed) // <-- Functional reduction
}
