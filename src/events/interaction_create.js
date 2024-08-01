const { Events } = require("discord.js")
const { post_command_usage_update } = require("../helper")

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return

    const command = interaction.client.commands.get(interaction.commandName)

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`)
      return
    }

    try {
      // post_command_usage_update(command.data.name)
      await command.execute(interaction)
    } catch (error) {
      /* Error handling */
      console.error(error)

      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply(
            `Error @ \`${interaction.commandName}\`: ${error}`,
          )
        } else {
          await interaction.followUp(
            `Error @ \`${interaction.commandName}\`: ${error}`,
          )
        }
      } catch (reply_error) {
        console.error("Failed to reply to the interaction:", reply_error)
      }
    }
  },
}
