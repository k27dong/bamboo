const {
  SlashCommandBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require("discord.js")
const {
  assert_channel_play_queue,
  send_msg_to_text_channel, trim_description,
} = require("../helper")
const { get_user_playlist } = require("../api/get_user_playlist")
const { get_songs_from_playlist } = require("../api/get_songs_from_playlist")
const { play } = require("../player")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("list")
    .setDescription("显示用户歌单"),
  async execute(interaction) {
    const filter = (i) => i.user.id === interaction.user.id
    let confirmation = undefined

    let queue = assert_channel_play_queue(interaction)

    if (!queue.user) {
      await interaction.reply(`No user set!`)
    } else {
      let playlist = await get_user_playlist(queue.user.userId)

      let playlist_items = playlist.map((pl, i) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(pl.name)
          .setDescription(trim_description(`${pl.count}首歌曲 | ${pl.play_count}播放`))
          .setValue(`${i}`),
      )

      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("playlist_select")
          .setPlaceholder("Nothing selected")
          .addOptions(playlist_items),
      )

      const response = await interaction.reply({
        content: "选择歌单",
        components: [row],
      })

      try {
        confirmation = await response.awaitMessageComponent({
          filter: filter,
          time: 20_000,
        })
      } catch (e) {
        await interaction.editReply({
          content: "No interactions were collected, cancelling",
          components: [],
        })
      }

      if (!confirmation) {
        throw "No interactions were collected, cancelling"
      }

      const selected_playlist = playlist[confirmation.values[0]]

      let playlist_msg = new EmbedBuilder()
        .setTitle(`${selected_playlist.name}`)
        // .setDescription(selected_playlist.name)
        .setThumbnail(selected_playlist.cover_img)
        .setFooter({
          text: `${selected_playlist.count} songs`,
        })

      interaction.editReply({
        content: `选择: **${selected_playlist.name}**`,
        components: [],
        embeds: [playlist_msg],
      })

      let playlist_songs = await get_songs_from_playlist(selected_playlist)

      for (let song of playlist_songs) {
        queue.track.push(song)
      }

      send_msg_to_text_channel(
        interaction,
        `Queued ${playlist_songs.length} songs from ${selected_playlist.name}`,
      )

      if (!queue.playing) {
        queue.playing = true
        queue.position = queue.track.length - playlist_songs.length
        play(interaction)
      }
    }
  },
}
