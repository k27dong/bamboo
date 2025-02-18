import { type Client, Events } from "discord.js"
import { AutoPoster } from "topgg-autoposter"

import { ENVIROMENT, TOPGG_TOKEN } from "@/common/utils/config"

export default (client: Client) => {
  client.on(Events.ClientReady, () => {
    console.log(`✅ Logged in as ${client.user?.tag}`)

    if (TOPGG_TOKEN && ENVIROMENT === "production") {
      const autoPoster = AutoPoster(TOPGG_TOKEN, client)
      autoPoster.on("posted", () => {
        console.log("✅ Posted stats to top.gg")
      })
    } else {
      console.log("⚙️ Skipping top.gg stats posting")
    }

    console.log("🚀 Bamboo On")
  })
}
