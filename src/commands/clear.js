const { SlashCommandBuilder } = require("discord.js")
const { assert_channel_play_queue } = require("../helper")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("清空播放队列"),
  async execute(interaction) {
    let queue = assert_channel_play_queue(interaction)

    queue.track = []
    queue.position = -1
    queue.playing = false

    queue.player?.stop();

    await interaction.reply("done")
  },
}
