import { randomBytes } from "node:crypto"
import path from "node:path"

export const NETEASE_EAPI_DOMAIN = "https://interface.music.163.com"
export const REQUEST_TIMEOUT_MS = 10_000

export const HTTP_STATUS = {
  OK: 200,
} as const

export const SEARCH_TYPE = {
  SONG: 1,
  ALBUM: 10,
  USER: 1002,
} as const

export const COOKIE_DIR = path.join(process.cwd(), "cookies")
export const COOKIE_PATH = path.join(COOKIE_DIR, "netease.cookie")
export const CLIENT_COOKIE =
  "os=iPhone OS; appver=9.0.90; osver=16.2; channel=distribution"
export const LOGIN_COOKIE = [
  CLIENT_COOKIE,
  `deviceId=${randomBytes(26).toString("hex").toUpperCase()}`,
].join("; ")

export enum QrStatus {
  Expired = "expired",
  Waiting = "waiting",
  Scanned = "scanned",
  Confirmed = "confirmed",
}

export const QR_STATUS_BY_CODE: Partial<Record<number, QrStatus>> = {
  800: QrStatus.Expired,
  801: QrStatus.Waiting,
  802: QrStatus.Scanned,
  803: QrStatus.Confirmed,
}

export const QR_TIMEOUT_MS = 60_000
export const QR_POLL_MS = 1_000

export const SONG_LINK = "https://music.163.com/song?id="
export const ALBUM_LINK = "https://music.163.com/album?id="
export const PLAYLIST_LINK = "https://music.163.com/playlist?id="

export const EXTRACTOR_IDENTIFIER = "com.k27dong.bamboo.bamboo-extractor"
export const SONG_DETAIL_TRACKID_LIMIT = 1000
