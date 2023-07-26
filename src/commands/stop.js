const { SlashCommandBuilder } = require("discord.js")
const { assert_channel_play_queue } = require("../helper")

module.exports = {
  data: new SlashCommandBuilder().setName("stop").setDescription("停止播放"),

  async execute(interaction) {
    let queue = assert_channel_play_queue(interaction)

    queue.playing = false
    queue.player?.stop()

    await interaction.reply("done")
  },
}
