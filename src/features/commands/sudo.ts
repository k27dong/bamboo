import {
  type Client,
  type CommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js"

import { getVersion, timestampToDate } from "@/common/utils/common"
import { OWNER_ID } from "@/common/utils/config"
import { logger } from "@/common/utils/logger"
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
      await interaction.deferReply({ ephemeral: true })
      const query = interaction.options.data[0].value as string

      if (interaction.user.id !== OWNER_ID) {
        throw new Error("⚠️ Permission denied, you are not the owner.")
      }

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
        case "up":
        case "uptime": {
          const uptime = client.uptime
          if (!uptime) {
            await interaction.editReply("```Uptime: N/A```")
            break
          }

          const days = Math.floor(uptime / 86400000)
          const hours = Math.floor((uptime / 3600000) % 24)
          const minutes = Math.floor((uptime / 60000) % 60)

          const parts = [
            days > 0 ? `${days}d` : "",
            hours > 0 ? `${hours}h` : "",
            `${minutes}m`,
          ]
            .filter(Boolean)
            .join(" ")

          await interaction.editReply(`\`\`\`Uptime: ${parts}\`\`\``)
          break
        }
        case "v":
        case "version": {
          await interaction.editReply(`\`\`\`Version: ${getVersion()}\`\`\``)
          break
        }
        default: {
          await interaction.editReply("Todo")
        }
      }
    } catch (error: any) {
      logger.error(interaction, Sudo, error)

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
