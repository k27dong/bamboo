const { SlashCommandBuilder } = require("@discordjs/builders")
const { assert_channel_play_queue } = require("../helper")
const { play } = require("../player")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("播放下一首"),
  async execute(interaction) {
    try {
      let queue = assert_channel_play_queue(interaction)

      if (!!queue.player) {
        queue.playing = true;

        if (!queue.looping && queue.position >= queue.track.length - 1) {
          queue.playing = false
          await interaction.reply(`End of queue.`)
          queue.player.stop()
          queue.position = -1
          return
        } else {
          queue.position = queue.looping
            ? (queue.position + 1) % queue.track.length
            : queue.position + 1
          await interaction.reply("done")
        }

        play(interaction)
      }
      else {
        await interaction.reply("Nothing is playing")
      }

    } catch (err) {
      console.log(err)
      await interaction.reply(`Error @ \`${interaction.commandName}\`: ${err}`)
    }
  },
}
