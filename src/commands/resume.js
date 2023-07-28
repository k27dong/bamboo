const { SlashCommandBuilder } = require("discord.js")
const { assert_channel_play_queue } = require("../helper")
const { play } = require("../player")

module.exports = {
  data: new SlashCommandBuilder().setName("resume").setDescription("继续播放"),

  async execute(interaction) {
    let queue = assert_channel_play_queue(interaction)

    if (!queue.playing) {
      queue.playing = true
      if (queue.position < 0) queue.position = 0
      play(interaction)
    }
    await interaction.reply("done")
  },
}
