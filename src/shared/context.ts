import { AsyncLocalStorage } from "node:async_hooks"

import type { BambooError } from "./errors"

export type Request = {
  command: string
  guildId: string | null
  failure: BambooError | null
  finished: boolean
}

export const request = new AsyncLocalStorage<Request>()

export const activeRequest = () => {
  const current = request.getStore()
  return current && !current.finished ? current : null
}

export const recordFailure = (error: BambooError) => {
  const current = activeRequest()
  if (current) current.failure = error
}

export const recordedFailure = () => activeRequest()?.failure ?? null
