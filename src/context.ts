import { AsyncLocalStorage } from "node:async_hooks"

import type { BambooError } from "@/errors"

export type Request = {
  command: string
  guildId: string | null
  failure: BambooError | null
}

export const request = new AsyncLocalStorage<Request>()

export const recordFailure = (error: BambooError) => {
  const current = request.getStore()
  if (current) current.failure = error
}
