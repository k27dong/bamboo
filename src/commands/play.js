const { SlashCommandBuilder } = require("discord.js")
const { search_song } = require("../api/search_song")
const { populate_info, assert_channel_play_queue } = require("../helper")
const { play } = require("../player")
const { useMainPlayer, QueryType } = require("discord-player")
const { identifier } = require("../extractor/NeteaseExtractor")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("播放音乐")
    .addStringOption((option) =>
      option.setName("搜索").setDescription("搜索音乐").setRequired(true),
    ),
  async execute(interaction) {
    await interaction.deferReply()
    let player = useMainPlayer()

    const info = populate_info(interaction)

    if (!info.voice_channel_id) {
      throw "you must be in a voice channel!"
    }

    const song_search_keywords = interaction.options.getString("搜索")

    // const query_result = await search_song(song_search_keywords)
    //
    // if (!query_result || query_result.length === 0) {
    //   throw `can't find anything for: ${song_search_keywords}`
    // }
    //
    // let song = query_result[0]
    //
    // queue.track.push(song)
    //
    // let play_message
    // if (song.source === "netease") {
    //   play_message = `**Queued**: ${song.name} ${
    //     !!song.ar.name ? `(${song.ar.name})` : ""
    //   }`
    // }
    // await interaction.editReply(play_message)
    //
    // if (!queue.playing) {
    //   queue.playing = true
    //   queue.position = queue.track.length - 1
    //   play(interaction)
    // }

    const { track } = await player.play(
      interaction.member.voice.channel.id,
      song_search_keywords,
      {
        nodeOptions: {
          metadata: {
            channel: interaction.channel,
            client: interaction.guild.members.me,
            requestedBy: interaction.user,
          },
          bufferingTimeout: 15000,
          leaveOnStop: true,
          leaveOnStopCooldown: 5000,
          leaveOnEnd: true,
          leaveOnEndCooldown: 15000,
          leaveOnEmpty: true,
          leaveOnEmptyCooldown: 300000,
          skipOnNoStream: true,
        },
      },
    )

    return interaction.followUp(`**${track.title}** enqueued!`)

    // const search_result = await player.search(song_search_keywords, {
    // searchEngine: `ext:${identifier}`,
    // })
    //
    // console.log(search_result)
    //
    // await player.play(interaction.member.voice.channel, search_result, {
    //   nodeOptions: {
    //     metadata: interaction,
    //   },
    // })
  },
}
