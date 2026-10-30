import { SlashCommandBuilder } from "discord.js"
import { useMainPlayer } from "discord-player"

import { type Command, CommandName } from "@/discord/command"
import { requireVoice } from "@/player/guards"
import { queueOptions } from "@/player/player"
import { BambooError, ErrorKind } from "@/shared/errors"
import { isLink } from "@/shared/format"

export const Play: Command = {
  data: new SlashCommandBuilder()
    .setName(CommandName.Play)
    .setDescription("播放单曲")
    .addStringOption((option) =>
      option.setName("搜索").setDescription("搜索音乐").setRequired(true),
    ),
  run: async ({ interaction }) => {
    const voiceChannel = requireVoice(interaction)
    const query = interaction.options.getString("搜索", true)
    if (isLink(query)) throw new BambooError(ErrorKind.NotFound)
    await interaction.deferReply()

    const { track } = await useMainPlayer().play(voiceChannel, query, {
      nodeOptions: queueOptions(interaction.channel),
    })

    await interaction.editReply(
      `**Queued**: ${track.title} ${track.author ? ` (${track.author}) ` : ""} [${track.duration}]`,
    )
  },
}
