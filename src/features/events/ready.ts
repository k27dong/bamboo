import { type Client, Events } from "discord.js"
import { AutoPoster } from "topgg-autoposter"

import { ENVIROMENT, TOPGG_TOKEN } from "@/common/utils/config"

export default (client: Client) => {
  client.on(Events.ClientReady, () => {
    const shardId = client.shard?.ids[0] ?? 0
    console.log(`✅ Logged in as ${client.user?.tag} (Shard ${shardId})`)

    // Only post Top.gg stats from shard 0 to avoid duplicate stats
    const isPrimaryShard = shardId === 0
    if (TOPGG_TOKEN && ENVIROMENT === "production" && isPrimaryShard) {
      const autoPoster = AutoPoster(TOPGG_TOKEN, client)
      autoPoster.on("error", (error) => {
        console.error("❌ Error in top.gg stats posting:", error)
      })
      console.log("⚙️ Top.gg stats posting enabled (shard 0)")
    } else if (!isPrimaryShard) {
      console.log(`⚙️ Skipping top.gg stats posting (shard ${shardId})`)
    } else {
      console.log("⚙️ Skipping top.gg stats posting")
    }

    console.log("🚀 Bamboo On")
  })
}
