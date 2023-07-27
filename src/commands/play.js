const { SlashCommandBuilder } = require("discord.js")
const { search_song } = require("../api/search_song")
const { populate_info, assert_channel_play_queue } = require("../helper")
const { play } = require("../player")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("播放音乐")
    .addStringOption((option) =>
      option.setName("搜索").setDescription("搜索音乐").setRequired(true),
    ),
  async execute(interaction) {
    let tunnel = "netease" // for now only netease is supported

    try {
      const info = populate_info(interaction)

      if (!info.voice_channel_id) throw "you must be in a voice channel!"

      let queue = assert_channel_play_queue(interaction)
      const song_search_keywords = interaction.options.getString("搜索")
      const query_result = await search_song(song_search_keywords)

      if (!query_result || query_result.length == 0)
        throw `can't find anything for: ${song_search_keywords}`

      let song = query_result[0]

      queue.track.push(song)
      if (song.source === "netease" || song.source === "youtube_url") {
        play_message = `**Queued**: ${song.name} ${
          !!song.ar.name ? `(${song.ar.name})` : ""
        }`
      }
      await interaction.reply(play_message)

      // console.log(queue.track)

      if (!queue.playing) {
        queue.playing = true
        queue.position = queue.track.length - 1
        play(interaction)
      }
    } catch (err) {
      console.log(err)
      await interaction.reply(`Error @ \`${interaction.commandName}\`: ${err}`)
    }
  },
}
