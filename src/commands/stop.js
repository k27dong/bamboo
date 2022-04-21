const { SlashCommandBuilder } = require("@discordjs/builders")
const { assert_channel_play_queue } = require("../helper")

module.exports = {
  data: new SlashCommandBuilder().setName("stop").setDescription("停止播放"),
  async execute(interaction) {
    try {
      let queue = assert_channel_play_queue(interaction)

      queue.playing = false

      if (!!queue.player) {
        queue.player.stop()
      }

      await interaction.reply("done")
    } catch (err) {
      console.log(err)
      await interaction.reply(`Error @ \`${interaction.commandName}\`: ${err}`)
    }
  },
}
