const { SlashCommandBuilder } = require("discord.js")
const { assert_channel_play_queue, shuffle } = require("../helper")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("随机打乱播放列表"),
  async execute(interaction) {
      let queue = assert_channel_play_queue(interaction)

      if (queue.track.length > 1) {
        let to_be_shuffled = queue.track.slice(queue.position + 1, queue.length)
        let shuffled = shuffle(to_be_shuffled)

        Array.prototype.splice.apply(
          queue.track,
          [queue.position + 1, shuffled.length].concat(shuffled)
        )
      }

      await interaction.reply("done")
  },
}
