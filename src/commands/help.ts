import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type Client,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js"

import { config } from "@/config"
import {
  DONATION_LINK,
  ENABLE_DONATION_LINK,
  HELP_HIDDEN_COMMANDS,
} from "@/constants"

import { commands } from "."
import { type Command, CommandName } from "./command"

// Fetches support server invite from whichever shard has it
async function getSupportServerInvite(client: Client): Promise<string | null> {
  if (!config.discord.supportServerId || !config.discord.supportChannelId)
    return null

  // If not sharded, access directly
  if (!client.shard) {
    const channel = client.guilds.cache
      .get(config.discord.supportServerId)
      ?.channels.cache.get(config.discord.supportChannelId)
    if (!channel?.isTextBased() || channel.isThread()) return null
    const invite = await channel.createInvite()
    return invite.url
  }

  // Broadcast to all shards - only the one with the guild will return a URL
  const results = await client.shard.broadcastEval(
    async (c, { serverId, channelId }) => {
      const guild = c.guilds.cache.get(serverId)
      if (!guild) return null
      const channel = guild.channels.cache.get(channelId)
      if (!channel?.isTextBased() || channel.isThread()) return null
      const invite = await channel.createInvite()
      return invite.url
    },
    {
      context: {
        serverId: config.discord.supportServerId,
        channelId: config.discord.supportChannelId,
      },
    },
  )

  return results.find((url) => url !== null) ?? null
}

export const Help: Command = {
  data: new SlashCommandBuilder()
    .setName(CommandName.Help)
    .setDescription("帮助")
    .addStringOption((option) =>
      option
        .setName("指令")
        .setDescription("获取具体某一条指令的信息")
        .setRequired(false),
    ),
  run: async ({ interaction }) => {
    const name = interaction.options.getString("指令")

    const available = commands
      .filter((command) => !HELP_HIDDEN_COMMANDS.includes(command.data.name))
      .sort((a, b) => a.data.name.localeCompare(b.data.name))

    const messageParts: string[] = []

    if (!name) {
      const commandsList = available
        .map(({ data }) => `${data.name.padEnd(10)}${data.description}`)
        .join("\n")

      messageParts.push(`📚 **完整指令列表：**`, `\`\`\`${commandsList}\`\`\``)
    } else {
      const command = available.find(({ data }) => data.name === name)

      if (!command) {
        await interaction.reply({
          content: `Command *${name}* not found.`,
          flags: MessageFlags.Ephemeral,
        })
        return
      }

      messageParts.push(
        `📝 **指令详情：**`,
        `\`\`\`${command.data.name} | ${command.data.description}\n\n${command.manual ?? ""}\`\`\``,
      )
    }

    const component = new ActionRowBuilder<ButtonBuilder>()

    const inviteUrl = await getSupportServerInvite(interaction.client)
    if (inviteUrl) {
      if (!name) {
        messageParts.push(`👥 加入官方服务器：${inviteUrl}`)
      } else {
        component.addComponents(
          new ButtonBuilder()
            .setLabel("官方")
            .setStyle(ButtonStyle.Link)
            .setURL(inviteUrl)
            .setEmoji("👥"),
        )
      }
    }

    if (ENABLE_DONATION_LINK) {
      component.addComponents(
        new ButtonBuilder()
          .setLabel("赞助")
          .setStyle(ButtonStyle.Link)
          .setURL(DONATION_LINK)
          .setEmoji("💰"),
      )
    }

    await interaction.reply({
      content: messageParts.join("\n"),
      components: [component],
    })
  },
}
