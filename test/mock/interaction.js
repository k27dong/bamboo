const {
  CommandInteraction,
  CommandInteractionOptionResolver,
} = require("discord.js")

const date_to_snowflake = (date) => {
  return String(BigInt(date.getTime() - 1288834974657) * BigInt(4194304))
}

const build_interaction = async (
  client,
  application_id,
  guild_id,
  channel_id,
  user_id,
  type,
  name,
  sub_command,
  reply,
  defer_reply,
  edit_reply,
  follow_up,
  delete_reply,
  options,
  command_id,
  preset_guild = null,
  preset_member = null,
) => {
  const guild = preset_guild || (await client.guilds.fetch(guild_id))
  const member = preset_member || (await guild.members.fetch(user_id))
  const user = member.user

  let interaction = new CommandInteraction(client, {
    data: { type, guild, user },
    user,
  })

  interaction.id = date_to_snowflake(new Date())
  interaction.type = type
  interaction.guildId = guild.id
  interaction.reply = reply
  interaction.deferReply = defer_reply
  interaction.editReply = edit_reply
  interaction.followUp = follow_up
  interaction.deleteReply = delete_reply
  interaction.commandName = name
  interaction.channelId = channel_id
  interaction.applicationId = application_id
  interaction.commandId = command_id
  interaction.member = member
  interaction.options = new CommandInteractionOptionResolver(client, options)
  interaction.options._subcommand = sub_command
  interaction.isCommand = () => true

  return interaction
}

exports.build_interaction = build_interaction
