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
      post_command_usage_update(command.data.name)
      await command.execute(interaction)
    } catch (error) {
      /* Error handling */
      console.error(error)

      if (!interaction.replied) {
        await interaction.reply(
          `Error @ \`${interaction.commandName}\`: ${error}`,
        )
      }
    }
  },
}
