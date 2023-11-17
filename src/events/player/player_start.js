const { GuildQueueEvent } = require("discord-player")

module.exports = {
  name: GuildQueueEvent.playerStart,
  async execute(queue, track) {
    queue.metadata.channel.send(`Started playing **${track.title}**!`)
  },
}
