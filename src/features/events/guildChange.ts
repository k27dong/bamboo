import { type Client, Events } from "discord.js"

export default (client: Client) => {
  client.on(Events.GuildCreate, (guild) => {
    console.log(`✅ Joined guild: ${guild.name}`)
  })
  client.on(Events.GuildDelete, (guild) => {
    console.log(`❌ Left guild: ${guild.name}`)
  })
}
