import { type CommandInteraction, EmbedBuilder, GuildMember } from "discord.js"

export const checkInVoiceChannel = async (interaction: CommandInteraction) => {
  if (
    !(interaction.member instanceof GuildMember) ||
    !interaction.member.voice.channel
  ) {
    await interaction.followUp({
      embeds: [
        new EmbedBuilder().setColor(0xaa0000).setAuthor({
          name: "You need to be in a voice channel.",
        }),
      ],
    })
    throw new Error("User not in voice channel.")
  }
}
