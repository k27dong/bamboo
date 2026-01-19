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

interface ShardGuildData {
  guilds: StatGuildsRecord[]
  memberCount: number
}

// Aggregates guild data across all shards
async function getAllGuildsData(client: Client): Promise<ShardGuildData> {
  // If not sharded, return local data directly
  if (!client.shard) {
    const guilds = client.guilds.cache
      .map((guild) => ({
        name: guild.name,
        id: guild.id,
        joinedTimeClean: timestampToDate(guild.joinedTimestamp),
        joinedTimestamp: guild.joinedTimestamp,
      }))
      .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp)
      .map(({ joinedTimestamp, ...rest }) => rest)

    const memberCount = client.guilds.cache.reduce(
      (sum, guild) => sum + guild.memberCount,
      0,
    )

    return { guilds, memberCount }
  }

  // Fetch from all shards
  const results = await client.shard.broadcastEval((c) => {
    return c.guilds.cache.map((guild) => ({
      name: guild.name,
      id: guild.id,
      joinedTimestamp: guild.joinedTimestamp,
      memberCount: guild.memberCount,
    }))
  })

  // Flatten and aggregate results from all shards
  const allGuilds = results.flat()
  const memberCount = allGuilds.reduce((sum, g) => sum + g.memberCount, 0)

  const guilds = allGuilds
    .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp)
    .map((g) => ({
      name: g.name,
      id: g.id,
      joinedTimeClean: timestampToDate(g.joinedTimestamp),
    }))

  return { guilds, memberCount }
}

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
          const { guilds, memberCount } = await getAllGuildsData(client)

          console.table(guilds)
          console.log("TOTAL USERS: " + memberCount)

          const shardInfo = client.shard ? ` (${client.shard.count} shards)` : ""
          await interaction.editReply(
            `\`\`\`Number of servers: ${guilds.length}${shardInfo}\nTotal users: ${memberCount}\`\`\``,
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

          const shardId = client.shard?.ids[0] ?? 0
          await interaction.editReply(`\`\`\`Uptime: ${parts} (shard ${shardId})\`\`\``)
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
