const { SlashCommandBuilder } = require("@discordjs/builders")
const { assert_channel_play_queue } = require("../helper")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("开启/关闭单曲循环"),
  async execute(interaction) {
    try {
      let queue = assert_channel_play_queue(interaction)

      queue.looping = !queue.looping
      await interaction.reply(`单曲循环: ${queue.looping ? "**ON**" : "**OFF**"}`)
    } catch (err) {
      console.log(err)
      await interaction.reply(`Error @ \`${interaction.commandName}\`: ${err}`)
    }
  },
}
