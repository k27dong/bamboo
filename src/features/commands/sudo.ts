import {
  type Client,
  type CommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js"

import { timestampToDate } from "@/common/utils/common"
import type { Command } from "@/core/commands/Command"
import type { StatGuildsRecord } from "@/env"

const SudoOption = new SlashCommandBuilder()
  .setName("sudo")
  .setDescription("命令行")
  .addStringOption((option) =>
    option.setName("run").setDescription("commands").setRequired(true),
  )

export const Sudo: Command = {
  name: SudoOption.name,
  description: SudoOption.description,
  data: SudoOption,
  run: async (client: Client, interaction: CommandInteraction) => {
    try {
      await interaction.deferReply()
      const query = interaction.options.data[0].value as string

      switch (query) {
        case "ls": {
          const table: StatGuildsRecord[] = interaction.client.guilds.cache
            .map((guild) => ({
              name: guild.name,
              id: guild.id,
              joinedTimeClean: timestampToDate(guild.joinedTimestamp),
            }))
            .sort(
              (a, b) =>
                interaction.client.guilds.cache.get(a.id)!.joinedTimestamp -
                interaction.client.guilds.cache.get(b.id)!.joinedTimestamp,
            )

          const count = interaction.client.guilds.cache.reduce(
            (sum, guild) => sum + guild.memberCount,
            0,
          )

          console.table(table)
          console.log("TOTAL USERS: " + count)
          await interaction.editReply(
            `\`\`\`Number of servers: ${table.length}\nTotal users: ${count}\`\`\``,
          )
          break
        }
        default: {
          await interaction.editReply("Todo")
        }
      }
    } catch (error: any) {
      console.error(`❌ Error in ${Sudo.name} command:`, error)

      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply()
      }

      await interaction.followUp({
        content: `❌ **Error**\n\`\`\`${error}\`\`\``,
        flags: MessageFlags.Ephemeral,
      })
    }
  },
}
