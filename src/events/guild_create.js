const { Events } = require("discord.js")
const { post_server_list_update } = require("../helper")

module.exports = {
  name: Events.GuildCreate,
  async execute(guild) {
    post_server_list_update(guild)
  },
}
