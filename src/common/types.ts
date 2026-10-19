import type { RequestOptions } from "node:http"

import type { TextChannel } from "discord.js"

import type { ExtractorSearchType } from "@/constants"

export interface QueueMetadata {
  channel: TextChannel
}

export interface ExtractorSearchOptions extends RequestOptions {
  searchType: ExtractorSearchType
}

export const extractorSearchOptions = (
  options: ExtractorSearchOptions,
): ExtractorSearchOptions => options
