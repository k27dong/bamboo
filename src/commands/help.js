const { SlashCommandBuilder } = require("discord.js")
const { get_internal_doc } = require("../docs/general_doc")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("帮助")
    .addStringOption((option) =>
      option
        .setName("指令")
        .setDescription("获取具体某一条指令的信息")
        .setRequired(false),
    ),
  async execute(interaction) {
    let command_param = interaction.options.getString("指令")
    if (!!command_param) command_param = command_param.split(" ")[0]

    let invitation = await interaction.client.guilds.cache
      .get(interaction.client.support_server_id)
      ?.channels.cache.get(interaction.client.support_channel_id)
      ?.createInvite()

    await interaction.reply(
      "```" +
        `${get_internal_doc(command_param)}` +
        "```\n" +
        (!command_param && invitation ? `Support Server: ${invitation}` : ""),
    )
  },
}
