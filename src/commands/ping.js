const { SlashCommandBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("replies with Pong!"),
  async execute(interaction) {
    await interaction.reply("Pong!")
  }
}
