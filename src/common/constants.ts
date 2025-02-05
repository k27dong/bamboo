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
