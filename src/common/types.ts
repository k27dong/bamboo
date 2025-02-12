import type { TextChannel } from "discord.js"

import type { ExtractorSearchType } from "@/common/constants"

export interface QueueMetadata {
  channel: TextChannel
}

export interface ExtractorSearchOptions {
  searchType: ExtractorSearchType
}
