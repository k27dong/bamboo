import { type Client, MessageFlags, SlashCommandBuilder } from "discord.js"
import { match } from "ts-pattern"

import { type Command, CommandName } from "@/discord/command"
import { config } from "@/shared/config"
import { timestampToDate } from "@/shared/format"

enum SudoAction {
  List = "ls",
  Up = "up",
  Uptime = "uptime",
  V = "v",
  Version = "version",
}

const isSudoAction = (value: string): value is SudoAction =>
  Object.values<string>(SudoAction).includes(value)

interface StatGuildsRecord {
  name: string
  id: string
  joinedTimeClean: string
}

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
        joinedTimestamp: guild.joinedTimestamp,
      }))
      .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp)
      .map(({ name, id, joinedTimestamp }) => ({
        name,
        id,
        joinedTimeClean: timestampToDate(joinedTimestamp),
      }))

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

const listServers = async (client: Client) => {
  const { guilds, memberCount } = await getAllGuildsData(client)

  console.table(guilds)
  console.log("TOTAL USERS: " + memberCount)

  const shardInfo = client.shard ? ` (${client.shard.count} shards)` : ""
  return `\`\`\`Number of servers: ${guilds.length}${shardInfo}\nTotal users: ${memberCount}\`\`\``
}

const uptime = (client: Client) => {
  if (!client.uptime) return "```Uptime: N/A```"

  const days = Math.floor(client.uptime / 86400000)
  const hours = Math.floor((client.uptime / 3600000) % 24)
  const minutes = Math.floor((client.uptime / 60000) % 60)

  const parts = [
    days > 0 ? `${days}d` : "",
    hours > 0 ? `${hours}h` : "",
    `${minutes}m`,
  ]
    .filter(Boolean)
    .join(" ")

  const shardId = client.shard?.ids[0] ?? 0
  return `\`\`\`Uptime: ${parts} (shard ${shardId})\`\`\``
}

export const Sudo: Command = {
  data: new SlashCommandBuilder()
    .setName(CommandName.Sudo)
    .setDescription("命令行")
    .addStringOption((option) =>
      option.setName("run").setDescription("commands").setRequired(true),
    ),
  run: async ({ interaction }) => {
    if (interaction.user.id !== config.discord.ownerId) {
      await interaction.reply({
        content: "⚠️ Permission denied, you are not the owner.",
        flags: MessageFlags.Ephemeral,
      })
      return
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral })
    const action = interaction.options.getString("run", true)

    const text = isSudoAction(action)
      ? await match(action)
          .with(SudoAction.List, () => listServers(interaction.client))
          .with(SudoAction.Up, SudoAction.Uptime, () =>
            uptime(interaction.client),
          )
          .with(
            SudoAction.V,
            SudoAction.Version,
            () => `\`\`\`Version: ${BAMBOO_VERSION}\`\`\``,
          )
          .exhaustive()
      : "Todo"

    await interaction.editReply(text)
  },
}
