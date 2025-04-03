import {
    type Client,
    type CommandInteraction,
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType,
    TextChannel,
} from "discord.js"

import { logger } from "@/common/utils/logger"
import type { Command } from "@/core/commands/Command"

const CleanOption = new SlashCommandBuilder()
  .setName("clean")
  .setDescription("清理历史消息")
  .addIntegerOption((option) =>
    option
      .setName("amount")
      .setDescription("Number of messages to delete (max 99)")
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(99)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)

export const Clean: Command = {
    name: CleanOption.name,
    description: CleanOption.description,
    data: CleanOption,
    manual: "清理当前文字频道（输入数量的）历史消息，单次最多可清理99条。",
    run: async (_: Client, interaction: CommandInteraction) => {
        try {
            // check the channel type
            if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) {
                await interaction.reply({
                    content: "❌ This command can only be used in the text channels.",
                    ephemeral: true,
                })
                
                return
            
            }

            const channel = interaction.channel as TextChannel
            const amount = interaction.options.get("amount")?.value as number
            
            // // check amount 
            // if (amount < 1 || amount > 99) {
            //     await interaction.reply({
            //         content: "❌ A maximum of 99 messages can be cleaned at one time.",
            //         ephemeral: true,
            //     })
                
            //     return
            // }

            // fetch and delete messages
            const initialReply = await interaction.reply({
                content: `Cleaning... This might take a short while...`,
                fetchReply: true,
            })
            
            // djs can only fetch 100 msg at once. (so 99 + 1 (this interaction)) will be fetched
            // If extending this command in the future, could count rounds by (amount / 100 | 0 + 1) and delete by loop
            const fetchMessages = await channel.messages.fetch({ limit: amount + 1 })

            // filter interaction msg out
            const deleteMessages = fetchMessages.filter(msg => msg.id !== initialReply.id)

            await channel.bulkDelete(deleteMessages, true)

            await initialReply.edit({
                content: `✅ Successfully cleaned ${fetchMessages.size - 1} messages.`
            })
            

        } catch (error: any) {
            logger.error(interaction, Clean, error)

            if (!interaction.deferred && !interaction.replied) {
              await interaction.deferReply()  // will not happen if error in bulkDelete stage.
            }
      
            await interaction.followUp({
              content: `❌ **Error**\n\`\`\`${error}\`\`\``
            })
        }
    }
}