import { createHash } from "node:crypto"
import { promises as fs } from "node:fs"
import { setTimeout as sleep } from "node:timers/promises"

import NeteaseCloudMusicApi from "@neteasecloudmusicapienhanced/api"
import qrcode from "qrcode-terminal"
import { match } from "ts-pattern"

import { config } from "@/config"
import { SourceId } from "@/sources/source"

import {
  CLIENT_COOKIE,
  COOKIE_DIR,
  COOKIE_PATH,
  HTTP_STATUS,
  LOGIN_COOKIE,
  NETEASE_EAPI_DOMAIN,
  QR_POLL_MS,
  QR_STATUS_BY_CODE,
  QR_TIMEOUT_MS,
  QrStatus,
} from "./constants"
import type { QrCodeAnswer, QrKeyAnswer } from "./types"

const savedCookie = async (): Promise<string | null> => {
  try {
    return await fs.readFile(COOKIE_PATH, "utf8")
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error
    return null
  }
}

const saveCookie = async (cookie: string) => {
  await fs.mkdir(COOKIE_DIR, { recursive: true })
  await fs.writeFile(COOKIE_PATH, cookie, "utf8")
  console.log(`✅ Cookie saved to ${COOKIE_PATH}`)
}

const waitForQrConfirmation = async (unikey: string): Promise<string> => {
  const deadline = Date.now() + QR_TIMEOUT_MS
  while (Date.now() < deadline) {
    const { body } = await NeteaseCloudMusicApi.login_qr_check({
      key: unikey,
      cookie: LOGIN_COOKIE,
      domain: NETEASE_EAPI_DOMAIN,
    })
    const status = QR_STATUS_BY_CODE[body.code]
    const cookie = status
      ? match(status)
          .with(QrStatus.Confirmed, () => body.cookie)
          .with(QrStatus.Expired, () => {
            throw new Error("QR code expired")
          })
          .with(QrStatus.Waiting, QrStatus.Scanned, () => null)
          .exhaustive()
      : null
    if (cookie) return cookie
    await sleep(QR_POLL_MS)
  }
  throw new Error("QR code confirmation timed out")
}

const qrLogin = async (): Promise<string> => {
  console.log("Logging in to Netease Music...")

  const qrKey = await NeteaseCloudMusicApi.login_qr_key({
    cookie: LOGIN_COOKIE,
    domain: NETEASE_EAPI_DOMAIN,
  })
  if (qrKey.status !== HTTP_STATUS.OK) {
    throw new Error(`Failed to get QR key: ${qrKey.status}`)
  }
  const { unikey } = qrKey.body.data as QrKeyAnswer

  const qrCode = await NeteaseCloudMusicApi.login_qr_create({ key: unikey })
  if (qrCode.status !== HTTP_STATUS.OK) {
    throw new Error(`Failed to get QR code: ${qrCode.status}`)
  }
  const { qrurl } = qrCode.body.data as QrCodeAnswer
  qrcode.generate(qrurl, { small: true })

  const cookie = await waitForQrConfirmation(unikey)
  await saveCookie(cookie)
  console.log("✅ Successfully logged in to Netease Music")
  return cookie
}

const sessionCookie = async (): Promise<string> => {
  if (config.netease.cookie) {
    console.log(`✅ Cookie ${SourceId.Netease} provided, skipping login`)
    return config.netease.cookie
  }
  const saved = await savedCookie()
  if (saved) {
    console.log(`✅ Cookie ${SourceId.Netease} found, skipping login`)
    return saved
  }
  return qrLogin()
}

export const login = async (): Promise<string> => {
  const session = await sessionCookie()
  const deviceId = createHash("sha256")
    .update(session)
    .digest("hex")
    .slice(0, 52)
    .toUpperCase()
  return `${session}; ${CLIENT_COOKIE}; deviceId=${deviceId}`
}
