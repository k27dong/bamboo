const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js")
const {
  populate_info,
  assert_channel_play_queue,
  send_msg_to_text_channel,
} = require("../helper")
const { search_album } = require("../api/search_album")
const { get_album_songs } = require("../api/get_album_songs")
const { play } = require("../player")

/**
 * Todo: Comment this file, include player
 */
module.exports = {
  data: new SlashCommandBuilder()
    .setName("album")
    .setDescription("专辑搜索")
    .addStringOption((option) =>
      option.setName("搜索").setDescription("专辑名").setRequired(true),
    ),
  async execute(interaction) {
    const filter = (i) => i.user.id === interaction.user.id
    const info = populate_info(interaction)
    let confirmation = undefined

    if (!info.voice_channel_id) {
      throw "you must be in a voice channel!"
    }

    let queue = assert_channel_play_queue(interaction)
    const song_search_keywords = interaction.options.getString("搜索")
    const query_result = await search_album(song_search_keywords)

    if (query_result.length == 0) {
      throw "can't find any result"
    }

    let album_items = query_result.map((al, i) =>
      new StringSelectMenuOptionBuilder()
        .setLabel(al.name)
        .setDescription(
          `${al.ar} | ${al.size}首 | ${new Date(al.date).getFullYear()}`,
        )
        .setValue(`${i}`),
    )

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("select")
        .setPlaceholder("Nothing selected")
        .addOptions(album_items),
    )

    const response = await interaction.reply({
      content: "搜索结果",
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

    // check if this check is necessary
    if (!confirmation) {
      throw "No interactions were collected, cancelling"
    }

    const album = query_result[confirmation.values[0]]

    interaction.editReply({
      content: `选择: **${album.name}**`,
      components: [],
    })

    let album_songs = await get_album_songs(album)

    for (let song of album_songs) {
      queue.track.push(song)
    }

    send_msg_to_text_channel(
      interaction,
      `Queued ${album_songs.length} songs from ${album.name}`,
    )

    if (!queue.playing) {
      queue.playing = true
      queue.position = queue.track.length - album_songs.length
      play(interaction)
    }
  },
}
