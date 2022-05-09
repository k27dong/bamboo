const { SlashCommandBuilder } = require("@discordjs/builders")
const { login_status } = require("NeteaseCloudMusicApi")
const { owner_id } = require("../../config.json")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cmd")
    .setDescription("developer settings")
    .addStringOption((option) =>
      option.setName("param").setDescription("parameters").setRequired(true)
    ),
  async execute(interaction) {
    if (interaction.member.user.id !== owner_id) {
      interaction.reply(
        "Permission denied, this command is for internal use only"
      )
      return
    }

    try {
      // let queue = assert_channel_play_queue(interaction)

      let params = interaction.options.getString("param").split(" ")

      switch (params[0]) {
        case "login_status":
          // send_msg_to_text_channel(interaction, await login_status({cookie: interaction.client.cookie}))
          let login_status_res = await login_status({
            cookie: interaction.client.cookie,
          })
          if (login_status_res.status == 200) {
            console.log(
              `account: ${
                !!login_status_res.body.data.profile
                  ? login_status_res.body.data.profile.nickname
                  : "none"
              }`
            )
          } else {
            console.log(`err code: ${login_status_res.status}`)
          }
          break
        default:
          break
      }

      await interaction.reply("done")
    } catch (err) {
      console.log(err)
      await interaction.reply(`Error @ \`${interaction.commandName}\`: ${err}`)
    }
  },
}
