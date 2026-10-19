import {
  type ChatInputCommandInteraction,
  MessageFlags,
  RESTJSONErrorCodes,
} from "discord.js"
import { isMatching, match, P } from "ts-pattern"

import { type Request, request } from "@/context"
import { ErrorMessage } from "@/core/player/embedMessages"
import { BambooError, ErrorKind, UNEXPECTED_ERROR_TEXT } from "@/errors"
import { logger } from "@/logger"

import type { Command } from "./command"

const NO_RESULT_CODE = "ERR_NO_RESULT"
const EXPIRED = { code: RESTJSONErrorCodes.UnknownInteraction } as const

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
    .with({ code: NO_RESULT_CODE }, () => {
      const { message } = recorded ?? new BambooError(ErrorKind.NotFound)
      logger.warn(message)
      return message
    })
    .with(EXPIRED, expired)
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
      await interaction.editReply({ embeds })
    } else {
      await interaction.reply({ embeds, flags: MessageFlags.Ephemeral })
    }
  } catch (error) {
    if (isMatching(EXPIRED, error)) expired()
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
