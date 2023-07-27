const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  SlashCommandBuilder,
  ComponentType,
} = require("discord.js")
const { search_song } = require("../api/search_song")
const { populate_info, assert_channel_play_queue } = require("../helper")
const { play } = require("../player")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("搜索")
    .addStringOption((option) =>
      option.setName("搜索").setDescription("搜索音乐").setRequired(true)
    ),
  async execute(interaction) {
    const filter = (i) => {
      i.deferUpdate()
      return i.user.id === interaction.user.id
    }
    try {
      const info = populate_info(interaction)

      if (!info.voice_channel_id) throw "you must be in a voice channel!"

      let queue = assert_channel_play_queue(interaction)
      const song_search_keywords = interaction.options.getString("搜索")
      const query_result = await search_song(song_search_keywords)

      if (!query_result || query_result.length == 0)
        throw `can't find anything for: ${song_search_keywords}`

      let song = query_result
      searched_items = []

      song.forEach((s, i) => {
        searched_items.push({
          label: s.name,
          description: `${s.ar.name} | ${s.al.name}`,
          value: `${i}`,
        })
      })

      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("searched_select")
          .setPlaceholder("Nothing selected")
          .addOptions(searched_items)
      )

      await interaction.reply({ content: "选择歌曲", components: [row] })
      const message = await interaction.fetchReply()

      message
        .awaitMessageComponent({
          filter,
          componentType: ComponentType.StringSelect,
          time: 20000, // 20 sec
        })
        .then(async (res) => {
          let play_message = ""
          const selected_song = song[res.values[0]]

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
            embeds: [],
          })

          queue.track.push(selected_song)

          if (!queue.playing) {
            queue.playing = true
            queue.position = queue.track.length - 1
            play(interaction)
          }
        })
        .catch((err) => {
          console.log(err)
          interaction.editReply({
            content: `err! ${err}`,
            components: [],
          })
        })
    } catch (err) {
      console.log(err)
      await interaction.reply(`Error @ \`${interaction.commandName}\`: ${err}`)
    }
  },
}
