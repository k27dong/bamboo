const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  SlashCommandBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js")
const { search_song } = require("../api/search_song")
const {
  populate_info,
  assert_channel_play_queue,
  trim_description,
} = require("../helper")
const { play } = require("../player")
const { MAX_DROPDOWN_SELECTION_LENGTH } = require("../common")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("搜索")
    .addStringOption((option) =>
      option.setName("搜索").setDescription("搜索音乐").setRequired(true),
    ),
  async execute(interaction) {
    const filter = (i) => i.user.id === interaction.user.id
    const info = populate_info(interaction)
    let confirmation = undefined

    await interaction.deferReply()

    if (!info.voice_channel_id) {
      throw "you must be in a voice channel!"
    }

    let queue = assert_channel_play_queue(interaction)
    const song_search_keywords = interaction.options.getString("搜索")
    const query_result = await search_song(song_search_keywords)

    if (!query_result || query_result.length === 0) {
      throw `can't find anything for: ${song_search_keywords}`
    }

    let song = query_result
    let searched_items = query_result.map((s, i) =>
      new StringSelectMenuOptionBuilder()
        .setLabel(trim_description(s.name))
        .setDescription(trim_description(`${s.ar.name} | ${s.al.name}`))
        .setValue(`${i}`),
    )

    let row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("searched_select")
        .setPlaceholder("Nothing selected")
        .addOptions(searched_items.slice(0, MAX_DROPDOWN_SELECTION_LENGTH)),
    )

    const response = await interaction.editReply({
      content: "搜索结果",
      components: [row],
    })

    try {
      confirmation = await response.awaitMessageComponent({
        filter: filter,
        time: 30_000,
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

    const selected_song = song[confirmation.values[0]]
    let play_message = ""

    if (
      selected_song.source === "netease" ||
      selected_song.source === "youtube_url"
    ) {
      play_message = `**Queued**: ${selected_song.name} ${
        !!selected_song.ar.name ? `(${selected_song.ar.name})` : ""
      }`
    }

    interaction.editReply({
      content: play_message,
      components: [],
    })

    queue.track.push(selected_song)

    if (!queue.playing) {
      queue.playing = true
      queue.position = queue.track.length - 1
      play(interaction)
    }
  },
}
