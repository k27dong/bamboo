const { SlashCommandBuilder } = require("discord.js")
const { assert_channel_play_queue } = require("../helper")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("开启/关闭列表循环"),
  async execute(interaction) {
    let queue = assert_channel_play_queue(interaction)

    queue.looping = !queue.looping
    await interaction.reply(`列表循环: ${queue.looping ? "**ON**" : "**OFF**"}`)
  },
}
