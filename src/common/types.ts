import type { RequestOptions } from "node:http"

import type { ExtractorSearchType } from "@/constants"

export interface ExtractorSearchOptions extends RequestOptions {
  searchType: ExtractorSearchType
}

export const extractorSearchOptions = (
  options: ExtractorSearchOptions,
): ExtractorSearchOptions => options
