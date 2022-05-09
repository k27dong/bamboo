const { SlashCommandBuilder } = require("@discordjs/builders")
const { assert_channel_play_queue } = require("../helper")
const { play } = require("../player")

module.exports = {
  data: new SlashCommandBuilder().setName("resume").setDescription("继续播放"),
  async execute(interaction) {
    try {
      let queue = assert_channel_play_queue(interaction)

      if (!queue.playing) {
        queue.playing = true
        if (queue.position < 0) queue.position = 0
        play(interaction)
      }
      await interaction.reply("done")
    } catch (err) {
      console.log(err)
      await interaction.reply(`Error @ \`${interaction.commandName}\`: ${err}`)
    }
  },
}
