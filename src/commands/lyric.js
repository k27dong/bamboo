const { SlashCommandBuilder } = require("discord.js")
const { assert_channel_play_queue, parse_lrc } = require("../helper")
const { get_raw_lyric_by_id } = require("../api/get_raw_lyric_by_id")

module.exports = {
  data: new SlashCommandBuilder().setName("lyric").setDescription("显示歌词"),

  async execute(interaction) {
    let queue = assert_channel_play_queue(interaction)

    if (!!queue.player && !!queue.track[queue.position]) {
      if (queue.track[queue.position].source === "netease") {
        const raw_lrc = await get_raw_lyric_by_id(
          queue.track[queue.position].id,
        )
        await interaction.reply(parse_lrc(raw_lrc))
      } else if (queue.track[queue.position].source === "uploaded_audio") {
        // Todo: find something other source
      }
    }
    else {
      await interaction.reply("Nothing is playing!")
    }
  },
}
