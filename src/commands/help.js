const { SlashCommandBuilder } = require("@discordjs/builders")
const { documentation } = require("../documentation")
const { SUPPORT_SERVER_SERVER, SUPPORT_SERVER_CHANNEL } = require("../common")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("帮助")
    .addStringOption((option) =>
      option
        .setName("指令")
        .setDescription("获取具体某一条指令的信息")
        .setRequired(false)
    ),
  async execute(interaction) {
    try {
      let command_param = interaction.options.getString("指令")
      if (!!command_param) command_param = command_param.split(" ")[0]

      let invitation = await interaction.client.guilds.cache
        .get(SUPPORT_SERVER_SERVER)
        .channels.cache.get(SUPPORT_SERVER_CHANNEL)
        .createInvite()

      await interaction.reply(
        "```" +
          `${documentation(command_param)}` +
          "```\n" +
          (!command_param ? `Support Server: ${invitation}` : "")
      )
    } catch (err) {
      console.log(err)
      await interaction.reply(`Error @ \`${interaction.commandName}\`: ${err}`)
    }
  },
}
