import NeteaseCloudMusicApi from "@neteasecloudmusicapienhanced/api"
import { createHash, randomBytes } from "crypto"
import { promises as fs } from "fs"
import path from "path"
import qrcode from "qrcode-terminal"

import { ApiServiceType, NETEASE_EAPI_DOMAIN } from "@/common/constants"
import type { QRCheckResponse, QRCodeResponse, QRKeyResponse } from "@/env"

const COOKIE_DIR = path.join(process.cwd(), "cookies")
const NETEASE_COOKIE_PATH = path.join(COOKIE_DIR, "netease.cookie")
const NETEASE_CLIENT_COOKIE =
  "os=iPhone OS; appver=9.0.90; osver=16.2; channel=distribution"
const NETEASE_LOGIN_COOKIE = [
  NETEASE_CLIENT_COOKIE,
  `deviceId=${randomBytes(26).toString("hex").toUpperCase()}`,
].join("; ")

export const setUpCookie = async (source: ApiServiceType) => {
  switch (source) {
    case ApiServiceType.Netease: {
      const login = await getNeteaseCookie()
      const deviceId = createHash("sha256")
        .update(login)
        .digest("hex")
        .slice(0, 52)
        .toUpperCase()
      return `${login}; ${NETEASE_CLIENT_COOKIE}; deviceId=${deviceId}`
    }
    default:
      throw new Error(`Unsupported source when setting up cookie`)
  }
}

const loadCookie = async (source: ApiServiceType): Promise<string | null> => {
  switch (source) {
    case ApiServiceType.Netease:
      try {
        return await fs.readFile(NETEASE_COOKIE_PATH, "utf8")
      } catch {
        return null
      }
    default:
      throw new Error(`Unsupported source when loading cookie`)
  }
}

const saveCookie = async (source: ApiServiceType, cookie: string) => {
  await fs.mkdir(COOKIE_DIR, { recursive: true })
  switch (source) {
    case ApiServiceType.Netease:
      await fs.writeFile(NETEASE_COOKIE_PATH, cookie, "utf8")
      console.log(`✅ Cookie saved to ${NETEASE_COOKIE_PATH}`)
      break
    default:
      throw new Error(`Unsupported source when loading cookie`)
  }
}

const getNeteaseCookie = async (): Promise<string> => {
  const savedCookie = await loadCookie(ApiServiceType.Netease)
  if (savedCookie) {
    console.log(`✅ Cookie ${ApiServiceType.Netease} found, skipping login`)
    return savedCookie
  }

  console.log("Logging in to Netease Music...")

  const qrKeyRes = await NeteaseCloudMusicApi.login_qr_key({
    cookie: NETEASE_LOGIN_COOKIE,
    domain: NETEASE_EAPI_DOMAIN,
  })
  if (qrKeyRes.status !== 200) {
    throw new Error(`Failed to get QR key: ${qrKeyRes.status}`)
  }

  const qrKeyResData = qrKeyRes.body.data as QRKeyResponse
  const qrCodeRes = await NeteaseCloudMusicApi.login_qr_create({
    key: qrKeyResData.unikey,
  })
  if (qrCodeRes.status !== 200) {
    throw new Error(`Failed to get QR code: ${qrCodeRes.status}`)
  }

  const qrCodeResData = qrCodeRes.body.data as QRCodeResponse
  qrcode.generate(qrCodeResData.qrurl, { small: true })

  const cookie = await waitForNeteaseQRConfirmation(qrKeyResData.unikey)

  await saveCookie(ApiServiceType.Netease, cookie)

  console.log("✅ Successfully logged in to Netease Music")
  return cookie
}

const waitForNeteaseQRConfirmation = async (
  unikey: string,
): Promise<string> => {
  const MAX_DURATION = 60 * 1000
  const STATUS_CONFIRMED = 803
  const STATUS_EXPIRED = 800
  const startTime = Date.now()

  while (Date.now() - startTime < MAX_DURATION) {
    const result = await NeteaseCloudMusicApi.login_qr_check({
      key: unikey,
      cookie: NETEASE_LOGIN_COOKIE,
      domain: NETEASE_EAPI_DOMAIN,
    })

    const response = result.body as QRCheckResponse

    switch (response.code) {
      case STATUS_CONFIRMED:
        return response.cookie
      case STATUS_EXPIRED:
        throw new Error("QR code expired")
      default:
        await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  throw new Error("QR code confirmation timed out")
}
