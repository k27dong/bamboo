import { type Client, Events, type Interaction } from "discord.js"

import { logger } from "@/logger"

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
            const started = performance.now()
            try {
              await command.run(client, interaction)
            } finally {
              logger.command(interaction, performance.now() - started)
            }
          }
        }
      } catch (error) {
        console.error("❌ Error in interactionCreate event:", error)
      }
    })()
  })
}
