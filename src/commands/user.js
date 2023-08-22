const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")
const { assert_channel_play_queue, trim_description } = require("../helper")
const { get_user_profile } = require("../api/get_user_profile")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("设置用户")
    .addStringOption((option) =>
      option
        .setName("用户名")
        .setDescription("填写网易云账号的用户名")
        .setRequired(true),
    ),
  async execute(interaction) {
    let queue = assert_channel_play_queue(interaction)
    let user_name = interaction.options.getString("用户名")
    let user = await get_user_profile(user_name)

    if (!user) {
      await interaction.reply(`No user found under the name ${user_name}`)
    } else {
      queue.user = user

      let user_msg = new EmbedBuilder()
        .setTitle(`User: ${user.nickname}`)
        .setDescription(trim_description(user.signature))
        .setThumbnail(user.avatarUrl)
        .setFooter({
          text: `${user.playlistCount} playlists`,
        })

      await interaction.reply({ content: `User set!`, embeds: [user_msg] })
    }
  },
}
