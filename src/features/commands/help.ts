import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type Client,
  type CommandInteraction,
  type Invite,
  MessageFlags,
  SlashCommandBuilder,
  type TextChannel,
} from "discord.js"

import { DONATION_LINK, ENABLE_DONATION_LINK } from "@/common/constants"
import {
  SUPPORT_SERVER_CHANNEL_ID,
  SUPPORT_SERVER_ID,
} from "@/common/utils/config"
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

      if (!!SUPPORT_SERVER_ID && !!SUPPORT_SERVER_CHANNEL_ID) {
        const supportServerInvite = client.guilds.cache
          .get(SUPPORT_SERVER_ID)
          ?.channels.cache.get(SUPPORT_SERVER_CHANNEL_ID) as TextChannel
        const invitation: Invite = await supportServerInvite.createInvite()

        if (!command) {
          messageParts.push(`👥 加入官方服务器：${invitation.url}`)
        } else {
          component.addComponents(
            new ButtonBuilder()
              .setLabel("官方")
              .setStyle(ButtonStyle.Link)
              .setURL(invitation.url)
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
      console.error("❌ Error in help command:", error)

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
