const { SlashCommandBuilder } = require("discord.js")
const { assert_channel_play_queue } = require("../helper")
const { play } = require("../player")

module.exports = {
  data: new SlashCommandBuilder().setName("back").setDescription("播放上一首"),
  async execute(interaction) {
    try {
      let queue = assert_channel_play_queue(interaction)

      if (!!queue.player) {
        queue.playing = true

        queue.position = queue.position - 1 < 0 ? 0 : queue.position - 1

        await interaction.reply("done")
        play(interaction)
      } else {
        await interaction.reply("Nothing is playing")
      }
    } catch (err) {
      console.log(err)
      await interaction.reply(`Error @ \`${interaction.commandName}\`: ${err}`)
    }
  },
}
