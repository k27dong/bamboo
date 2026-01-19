import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type Client,
  type CommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js"

import { DONATION_LINK, ENABLE_DONATION_LINK } from "@/common/constants"
import {
  SUPPORT_SERVER_CHANNEL_ID,
  SUPPORT_SERVER_ID,
} from "@/common/utils/config"
import { logger } from "@/common/utils/logger"
import type { Command } from "@/core/commands/Command"

import { Commands } from "."

const HelpOption = new SlashCommandBuilder()
  .setName("help")
  .setDescription("帮助")
  .addStringOption((option) =>
    option
      .setName("指令")
      .setDescription("获取具体某一条指令的信息")
      .setRequired(false),
  )

// Fetches support server invite from whichever shard has it
async function getSupportServerInvite(client: Client): Promise<string | null> {
  if (!SUPPORT_SERVER_ID || !SUPPORT_SERVER_CHANNEL_ID) return null

  // If not sharded, access directly
  if (!client.shard) {
    const channel = client.guilds.cache
      .get(SUPPORT_SERVER_ID)
      ?.channels.cache.get(SUPPORT_SERVER_CHANNEL_ID)
    if (!channel?.isTextBased()) return null
    const invite = await (channel as any).createInvite()
    return invite.url
  }

  // Broadcast to all shards - only the one with the guild will return a URL
  const results = await client.shard.broadcastEval(
    async (c, { serverId, channelId }) => {
      const guild = c.guilds.cache.get(serverId)
      if (!guild) return null
      const channel = guild.channels.cache.get(channelId)
      if (!channel?.isTextBased()) return null
      const invite = await (channel as any).createInvite()
      return invite.url as string
    },
    { context: { serverId: SUPPORT_SERVER_ID, channelId: SUPPORT_SERVER_CHANNEL_ID } },
  )

  return results.find((url) => url !== null) ?? null
}

export const Help: Command = {
  name: HelpOption.name,
  description: HelpOption.description,
  data: HelpOption,
  run: async (client: Client, interaction: CommandInteraction) => {
    try {
      const excludedCommands = ["sudo", "help", "ping"]
      const command = interaction.options.data[0]?.value as string | undefined

      const availableCommands = Commands.filter(
        (cmd) => !excludedCommands.includes(cmd.name),
      ).sort((a, b) => a.name.localeCompare(b.name))

      const messageParts: string[] = []

      if (!command) {
        const commandsList = availableCommands
          .map((cmd) => `${cmd.name.padEnd(10)}${cmd.description}`)
          .join("\n")

        messageParts.push(
          `📚 **完整指令列表：**`,
          `\`\`\`${commandsList}\`\`\``,
        )
      } else {
        const cmd = availableCommands.find((c) => c.name === command)

        if (!cmd) {
          throw new Error(`Command *${command}* not found.`)
        }

        messageParts.push(
          `📝 **指令详情：**`,
          `\`\`\`${cmd.name} | ${cmd.description}\n\n${cmd.manual ?? ""}\`\`\``,
        )
      }

      const component = new ActionRowBuilder<ButtonBuilder>()

      const inviteUrl = await getSupportServerInvite(client)
      if (inviteUrl) {
        if (!command) {
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
    } catch (error: any) {
      logger.error(interaction, Help, error)

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
