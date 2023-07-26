const { SlashCommandBuilder } = require("discord.js")
const { assert_channel_play_queue } = require("../helper")

module.exports = {
  data: new SlashCommandBuilder().setName("leave").setDescription("退出"),

  async execute(interaction) {
    let queue = assert_channel_play_queue(interaction)

    queue.playing = false
    queue.player?.stop()
    queue.connection?.destroy()

    interaction.client.queue.delete(interaction.guildId)

    await interaction.reply("done")
  },
}
