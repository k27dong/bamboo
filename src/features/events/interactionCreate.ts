import { type Client, Events, type Interaction } from "discord.js"

import { logger } from "@/common/utils/logger"

import { Commands } from "../commands"

export default (client: Client) => {
  client.on(Events.InteractionCreate, (interaction: Interaction) => {
    void (async () => {
      try {
        if (interaction.isChatInputCommand()) {
          const command = Commands.find(
            (command) => command.name === interaction.commandName,
          )

          if (command) {
            logger.info(interaction)
            await command.run(client, interaction)
          }
        }
      } catch (error) {
        console.error("❌ Error in interactionCreate event:", error)
      }
    })()
  })
}
