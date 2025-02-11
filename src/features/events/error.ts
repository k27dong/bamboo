import { type Client, Events } from "discord.js"

export default (client: Client) => {
  client.on(Events.Error, (error) => {
    console.error("❌ Discord client error:", error)
  })
}
