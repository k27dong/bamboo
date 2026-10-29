import { type ChatInputCommandInteraction, MessageFlags } from "discord.js"
import { isMatching, match, P } from "ts-pattern"

import { EXPIRED_INTERACTION, NO_RESULT_ERROR_CODE } from "@/common/constants"
import { type Request, request } from "@/common/context"
import { BambooError, ErrorKind, UNEXPECTED_ERROR_TEXT } from "@/common/errors"
import { logger } from "@/common/utils/logger"
import { ErrorMessage } from "@/core/player/embedMessages"

import type { Command } from "./Command"

const expired = () => {
  logger.warn("The interaction expired before it was answered")
  return null
}

const explain = (error: unknown, recorded: BambooError | null) =>
  match(error)
    .with(P.instanceOf(BambooError), ({ message }) => {
      logger.warn(message)
      return message
    })
    .with({ code: NO_RESULT_ERROR_CODE }, () => {
      const { message } = recorded ?? new BambooError(ErrorKind.NotFound)
      logger.warn(message)
      return message
    })
    .with(EXPIRED_INTERACTION, expired)
    .otherwise(() => {
      logger.error("Unexpected error", error)
      return UNEXPECTED_ERROR_TEXT
    })

const reply = async (
  interaction: ChatInputCommandInteraction,
  text: string,
) => {
  const embeds = [ErrorMessage(text)]
  try {
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: "", embeds, components: [] })
    } else {
      await interaction.reply({ embeds, flags: MessageFlags.Ephemeral })
    }
  } catch (error) {
    if (isMatching(EXPIRED_INTERACTION, error)) expired()
    else logger.error("The error reply failed", error)
  }
}

export const dispatch = async (
  command: Command,
  interaction: ChatInputCommandInteraction,
) => {
  const context: Request = {
    command: interaction.commandName,
    guildId: interaction.guildId,
    failure: null,
    finished: false,
  }
  await request.run(context, async () => {
    const started = performance.now()
    try {
      await command.run({ interaction })
    } catch (error) {
      const text = explain(error, context.failure)
      if (text !== null) await reply(interaction, text)
    } finally {
      context.finished = true
      logger.command(interaction, performance.now() - started)
    }
  })
}
