import { randomBytes } from "node:crypto"
import path from "node:path"

export const NETEASE_EAPI_DOMAIN = "https://interface.music.163.com"

export enum NeteaseHost {
  Eapi = "eapi",
  Default = "default",
}

export const DOMAIN_BY_HOST: Record<NeteaseHost, string | undefined> = {
  [NeteaseHost.Eapi]: NETEASE_EAPI_DOMAIN,
  [NeteaseHost.Default]: undefined,
}

export const REQUEST_TIMEOUT_MS = 10_000

export enum HttpStatus {
  Ok = 200,
}

export enum SearchType {
  Song = 1,
  Album = 10,
  User = 1002,
}

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
