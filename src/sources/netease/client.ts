import { inspect } from "node:util"

import type {
  RequestBaseConfig,
  Response as NeteaseAnswer,
} from "@neteasecloudmusicapienhanced/api"
import { match, P } from "ts-pattern"

import { config } from "@/config"
import { BambooError, ErrorKind } from "@/errors"
import { logger } from "@/logger"

import {
  HTTP_STATUS,
  NETEASE_EAPI_DOMAIN,
  REQUEST_TIMEOUT_MS,
} from "./constants"

export enum NeteaseHost {
  Eapi = "eapi",
  Default = "default",
}

type NeteaseCall = {
  call(params: RequestBaseConfig): Promise<NeteaseAnswer<unknown>>
}["call"]

type Outcome =
  | { settled: "answered"; body: unknown }
  | { settled: "rejected"; reason: unknown }
  | { settled: "timed out" }

const DOMAIN_BY_HOST: Record<NeteaseHost, string | undefined> = {
  [NeteaseHost.Eapi]: NETEASE_EAPI_DOMAIN,
  [NeteaseHost.Default]: undefined,
}

let cookie: string | undefined

export const setCookie = (session: string) => {
  cookie = session
}

const settle = (answer: Promise<NeteaseAnswer<unknown>>): Promise<Outcome> => {
  let timer: NodeJS.Timeout | undefined
  const limit = new Promise<Outcome>((resolve) => {
    timer = setTimeout(
      () => resolve({ settled: "timed out" }),
      REQUEST_TIMEOUT_MS,
    )
  })
  return Promise.race([
    answer.then(
      ({ body }): Outcome => ({ settled: "answered", body }),
      (reason: unknown): Outcome => ({ settled: "rejected", reason }),
    ),
    limit,
  ]).finally(() => clearTimeout(timer))
}

const describe = (value: unknown) =>
  inspect(value, { depth: 1, breakLength: Infinity })

const sourceDown = (why: string): never => {
  logger.warn(`NetEase ${why}`)
  throw new BambooError(ErrorKind.SourceDown)
}

export const request = async <T>(
  call: NeteaseCall,
  params: Record<string, unknown>,
  host: NeteaseHost,
): Promise<T> => {
  const outcome = await settle(
    call({
      ...params,
      cookie,
      realIP: config.netease.realIp,
      domain: DOMAIN_BY_HOST[host],
      timeout: REQUEST_TIMEOUT_MS,
    }),
  )
  return match(outcome)
    .with(
      { settled: "answered", body: { code: HTTP_STATUS.OK } },
      ({ body }) => body as T,
    )
    .with({ settled: "answered", body: { code: P.number } }, ({ body }) =>
      sourceDown(`answered with code ${body.code}`),
    )
    .with({ settled: "answered" }, ({ body }) =>
      sourceDown(`answered without a code: ${describe(body)}`),
    )
    .with(
      {
        settled: "rejected",
        reason: { body: { code: P.number, msg: P.string.minLength(1) } },
      },
      ({ reason }) =>
        sourceDown(`failed with code ${reason.body.code}: ${reason.body.msg}`),
    )
    .with(
      { settled: "rejected", reason: { body: { code: P.number } } },
      ({ reason }) => sourceDown(`failed with code ${reason.body.code}`),
    )
    .with({ settled: "rejected", reason: { status: P.number } }, ({ reason }) =>
      sourceDown(`failed with status ${reason.status}`),
    )
    .with({ settled: "rejected", reason: P.instanceOf(Error) }, ({ reason }) =>
      sourceDown(`failed: ${reason.message}`),
    )
    .with({ settled: "rejected" }, ({ reason }) =>
      sourceDown(`failed: ${describe(reason)}`),
    )
    .with({ settled: "timed out" }, () =>
      sourceDown(`gave no answer in ${REQUEST_TIMEOUT_MS} ms`),
    )
    .otherwise((unexpected) => sourceDown(`failed: ${describe(unexpected)}`))
}
