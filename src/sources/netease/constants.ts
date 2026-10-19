export const NETEASE_EAPI_DOMAIN = "https://interface.music.163.com"
export const REQUEST_TIMEOUT_MS = 10_000

export const SEARCH_TYPE = {
  SONG: 1,
  ALBUM: 10,
  USER: 1002,
} as const

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

export const SONG_LINK = "https://music.163.com/song?id="
export const ALBUM_LINK = "https://music.163.com/album?id="
export const PLAYLIST_LINK = "https://music.163.com/playlist?id="

export const EXTRACTOR_IDENTIFIER = "com.k27dong.bamboo.bamboo-extractor"
export const SONG_DETAIL_TRACKID_LIMIT = 1000
