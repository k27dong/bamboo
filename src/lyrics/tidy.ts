import OpenAI from "openai"

import { config } from "@/shared/config"
import {
  DISCORD_MESSAGE_CHAR_LIMIT,
  LYRIC_MODEL,
  LYRIC_MODEL_TIMEOUT_MS,
  NO_LYRICS,
  OPENROUTER_BASE_URL,
} from "@/shared/constants"

import { LYRIC_SANITIZATION_PROMPT } from "./prompt"

type LyricRequest = OpenAI.ChatCompletionCreateParamsNonStreaming & {
  reasoning: { enabled: boolean }
  provider: { sort: string }
}

type Tidied = { lines: string[] } | { skipped: string }

export const fitToMessage = (lines: string[]): string => {
  let lyricContent = ""

  for (const line of lines) {
    const escaped = line.replace(/`/g, "\\`") // Escape backticks
    const potentialLength = lyricContent.length + escaped.length + 1

    if (potentialLength > DISCORD_MESSAGE_CHAR_LIMIT - 4) {
      lyricContent += "\n..."
      break
    }

    lyricContent += `${escaped}\n`
  }

  return lyricContent.trim()
    ? `\`\`\`\n${lyricContent.trim()}\n\`\`\``
    : NO_LYRICS
}

export const parseLrc = (lrc: string): string => {
  const sanitizedLines = lrc
    .split("\n")
    .map((line) =>
      line
        .replace(/\[\d{1,2}:\d{2}(?:\.\d{1,3})?\]/g, "") // Timestamps
        .replace(/\s+/g, " ") // Whitespace
        .replace(/([!?,.])(?=\S)/g, "$1 ") // Punctuation spacing
        .replace(/(\s)([!?,.])(\s)/g, "$2$3") // Fix extra spaces
        .replace(/-\s+/g, "") // Fix split words
        .replace(/[“”]/g, '"') // Normalize quotes
        .replace(/[‘’]/g, "'")
        .trim(),
    )
    .filter((line) => line.length > 0)

  return fitToMessage(sanitizedLines)
}

const readAnswer = ({ choices: [choice] }: OpenAI.ChatCompletion): Tidied => {
  if (choice?.finish_reason !== "stop") {
    return {
      skipped: `the model stopped with finish reason ${choice?.finish_reason}`,
    }
  }
  const lines = (choice.message.content ?? "")
    .split("\n")
    .filter((line) => !line.startsWith("```"))
  return lines.some((line) => line.trim())
    ? { lines }
    : { skipped: "the model gave no text" }
}

export const askModel = (
  rawLyric: string,
  parsedLyric: string,
  deadline: AbortSignal,
): Promise<Tidied> => {
  const openrouter = new OpenAI({
    apiKey: config.openrouterApiKey,
    baseURL: OPENROUTER_BASE_URL,
    maxRetries: 0,
    timeout: LYRIC_MODEL_TIMEOUT_MS,
  })
  const request: LyricRequest = {
    model: LYRIC_MODEL,
    messages: [
      { role: "system", content: LYRIC_SANITIZATION_PROMPT },
      {
        role: "user",
        content: `Raw lyrics: ${rawLyric}\n\nParsed lyrics: ${parsedLyric}\n\nSummarize per the rules.`,
      },
    ],
    reasoning: { enabled: false },
    provider: { sort: "throughput" },
  }
  const ranOut: Tidied = {
    skipped: `ran out of time after ${LYRIC_MODEL_TIMEOUT_MS / 1000} s`,
  }
  const outOfTime = new Promise<Tidied>((resolve) => {
    deadline.addEventListener("abort", () => resolve(ranOut))
  })
  return Promise.race([
    outOfTime,
    openrouter.chat.completions
      .create(request, { signal: deadline })
      .then(readAnswer)
      .catch((error: unknown): Tidied =>
        deadline.aborted
          ? ranOut
          : { skipped: `the model failed (${String(error)})` },
      ),
  ])
}
