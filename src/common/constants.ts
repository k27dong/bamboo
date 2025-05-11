export const APP = "Bamboo"

export const ICONLINK = "https://www.kefan.me/bamboo.jpg"
export const APPLINK = "https://github.com/k27dong/bamboo"

export enum EmbedColors {
  Error = 0xbf2121,
  Warning = 0xd95829,
  Success = 0x027333,
  Playing = 0xadbc67,
}

export enum ApiServiceType {
  Netease = "netease",
  Bilibili = "bilibili",
}

export const QRCodeStatus = {
  CONFIRMED: 803,
  EXPIRED: 800,
} as const

export const HTTP_STATUS = {
  OK: 200,
} as const

export const DISCORD_MESSAGE_CHAR_LIMIT = 1990

export const EXTRACTOR_IDENTIFIER = "com.k27dong.bamboo.bamboo-extractor"

export enum ExtractorSearchType {
  AlbumLists,
  Album,
  Track,
  TrackInfo,
  Lyric,
  UserLists,
  UserPlaylists,
  UserPlaylistTracks,
  BilibiliVideo,
}

export const DISCORD_DROPDOWN_LIMIT = 25
export const DISCORD_SELECT_MENU_LIMIT = 100
export const DISCORD_EMBED_DESCRIPTION_LIMIT = 4000

export enum CustomButtonId {
  ShowDescription = "show_description",
}

export const UserSelectEmojiPool: string[] = [
  "🚀",
  "🌟",
  "🔥",
  "💎",
  "🎵",
  "🎸",
  "🎮",
  "🕹️",
  "📷",
  "🎨",
  "💡",
  "⚡",
  "🌈",
  "🍀",
  "🎭",
  "🤖",
  "🐉",
  "🐧",
  "🐱",
  "🦄",
  "🎩",
  "🎯",
  "🛸",
  "🏆",
  "🔮",
  "🕶️",
  "💻",
  "🌌",
  "📚",
  "🥋",
  "🍣",
  "🍕",
  "🥑",
  "🧋",
  "🎂",
  "🎈",
  "🌍",
  "⏳",
  "🎁",
  "🧩",
]

export const SONG_DETAIL_TRACKID_LIMIT = 1000

export const ENABLE_DONATION_LINK = true
export const DONATION_LINK = "https://www.buymeacoffee.com/kefan"

export const BILIBILI_ERROR_CODES = {
  SUCCESS: 0,
  REQUEST_ERROR: -400,
  PERMISSION_DENIED: -403,
  NOT_FOUND: -404,
  VIDEO_INVISIBLE: 62002,
  VIDEO_UNDER_REVIEW: 62004,
  VIDEO_PRIVATE: 62012,
  INVALID_BVID: -1,
  NO_DATA: -2,
  UNKNOWN_ERROR: -3,
} as const
