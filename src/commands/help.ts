import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js"

import {
  type Command,
  CommandName,
  HELP_HIDDEN_COMMANDS,
} from "@/discord/command"
import {
  DONATION_LINK,
  ENABLE_DONATION_LINK,
  SUPPORT_INVITE_URL,
} from "@/shared/constants"

import { commands } from "."

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

    if (!name) {
      messageParts.push(`👥 加入官方服务器：${SUPPORT_INVITE_URL}`)
    } else {
      component.addComponents(
        new ButtonBuilder()
          .setLabel("官方")
          .setStyle(ButtonStyle.Link)
          .setURL(SUPPORT_INVITE_URL)
          .setEmoji("👥"),
      )
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
