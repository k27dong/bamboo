const { SlashCommandBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
  .setName("reload")
  .setDescription("重载")
  .addStringOption(option =>
    option.setName('command')
    .setDescription('The command to reload.')
    .setRequired(true)),
  async execute(interaction) {
    const command_name = interaction.options.getString('command', true).toLowerCase();
    const command = interaction.client.commands.get(command_name);

    if (!command) {
      return interaction.reply(`There is no command with name \`${command_name}\`!`);
    }

    // remove command from cache
    delete require.cache[require.resolve(`./${command.data.name}.js`)];
    await interaction.client.commands.delete(command.data.name);

    // require command again and add it to the cache
    const new_command = require(`./${command.data.name}.js`);
    await interaction.client.commands.set(new_command.data.name, new_command);

    await interaction.reply(`Command \`${new_command.data.name}\` was reloaded!`);
  },
}
