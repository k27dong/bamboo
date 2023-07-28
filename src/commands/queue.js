const { SlashCommandBuilder } = require("discord.js")
const { assert_channel_play_queue, display_track } = require("../helper")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("显示播放队列")
    .addIntegerOption((option) =>
      option
        .setName("队列数量")
        .setDescription("显示队列数量")
        .setRequired(false),
    ),
  async execute(interaction) {
    let queue = assert_channel_play_queue(interaction)

    let track = queue.track
    let displayed_tracks = []
    let pos = queue.position > 0 ? queue.position : 0
    let remain = 20
    let back_amount = ~~(remain * 0.3)

    if (track.length !== 0) {
      displayed_tracks.push({
        song: track[pos],
        pos: pos,
        curr: true,
      })
      remain--

      let go_back = pos > back_amount ? back_amount : pos
      for (let i = 1; i <= go_back; i++, remain--) {
        displayed_tracks.unshift({
          song: track[pos - i],
          pos: pos - i,
          curr: false,
        })
      }

      let go_front =
        track.length - pos - 1 > remain ? remain : track.length - pos - 1
      for (let i = 1; i <= go_front; i++, remain--) {
        displayed_tracks.push({
          song: track[pos + i],
          pos: pos + i,
          curr: false,
        })
      }

      for (; remain > 0 && go_back + 1 <= pos; remain--, go_back++) {
        displayed_tracks.unshift({
          song: track[pos - go_back - 1],
          pos: pos - go_back - 1,
          curr: false,
        })
      }

      for (
        ;
        remain > 0 && go_front + pos + 1 < track.length;
        remain--, go_front++
      ) {
        displayed_tracks.push({
          song: track[pos + go_front + 1],
          pos: pos + go_front + 1,
          curr: false,
        })
      }
    }

    await interaction.reply(display_track(displayed_tracks))
  },
}
