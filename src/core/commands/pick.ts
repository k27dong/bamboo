import {
  ActionRowBuilder,
  type ChatInputCommandInteraction,
  ComponentType,
  MessageFlags,
  StringSelectMenuBuilder,
  type StringSelectMenuInteraction,
  type StringSelectMenuOptionBuilder,
} from "discord.js"

import {
  INTERFERENCE_TEXT,
  MENU_TIMEOUT_MS,
  SelectMenuId,
} from "@/common/constants"

export type PickOptions<T> = {
  content: string
  placeholder: string
  items: readonly T[]
  option: (item: T, index: number) => StringSelectMenuOptionBuilder
  timeoutText: string
}

export type Picked<T> = { item: T; click: StringSelectMenuInteraction }

export const pick = async <T>(
  interaction: ChatInputCommandInteraction,
  { content, placeholder, items, option, timeoutText }: PickOptions<T>,
): Promise<Picked<T> | null> => {
  const menu = new StringSelectMenuBuilder()
    .setCustomId(SelectMenuId.Pick)
    .setPlaceholder(placeholder)
    .addOptions(items.map(option))
  const message = await interaction.editReply({
    content,
    components: [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu),
    ],
  })
  const clicks = message.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    time: MENU_TIMEOUT_MS,
  })

  return new Promise((resolve, reject) => {
    let picked = false

    clicks.on("collect", (click) => {
      if (click.user.id !== interaction.user.id) {
        void click.reply({
          content: INTERFERENCE_TEXT,
          flags: MessageFlags.Ephemeral,
        })
        return
      }
      picked = true
      clicks.stop()
      const item = items[Number(click.values[0])]
      if (item === undefined) {
        reject(new Error(`No menu item for value ${click.values[0]}`))
        return
      }
      resolve({ item, click })
    })

    clicks.on("end", () => {
      if (picked) return
      interaction
        .editReply({ content: timeoutText, components: [] })
        .then(() => resolve(null), reject)
    })
  })
}
