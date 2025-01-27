import { type Client, Events, type Interaction } from "discord.js"

import { Commands } from "../commands"

export default (client: Client): void => {
  client.on(Events.InteractionCreate, (interaction: Interaction) => {
    void (async () => {
      try {
        if (interaction.isCommand()) {
          const command = Commands.find(
            (command) => command.name === interaction.commandName,
          )

          if (command) {
            await command.run(client, interaction)
          }
        }
      } catch (error) {
        console.error("❌ Error in interactionCreate event:", error)
      }
    })()
  })
}
