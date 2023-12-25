const { SlashCommandBuilder } = require("discord.js")
const { assert_channel_play_queue, populate_info, join_voice_channel } = require("../helper")
const { play } = require("../player")

module.exports = {
  data: new SlashCommandBuilder().setName("resume").setDescription("继续播放"),

  async execute(interaction) {
    let queue = assert_channel_play_queue(interaction)
    let info = populate_info(interaction)

    // check before queue.playing for manually disconnection/diff channel
    queue.connection = join_voice_channel(queue, info, interaction)

    if (!queue.playing) {
      queue.playing = true
      if (queue.position < 0) queue.position = 0
      play(interaction)
    }
    await interaction.reply("done")
  },
}
