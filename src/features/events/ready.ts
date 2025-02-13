import { type Client, Events } from "discord.js"

export default (client: Client) => {
  client.on(Events.ClientReady, () => {
    console.log(`✅ Logged in as ${client.user?.tag}`)
    console.log("🚀 Bamboo On")
  })
}
