import chalk, { type ChalkInstance } from "chalk"

export const APP = "Bamboo"

export const ICONLINK = "https://www.kefan.me/bamboo.jpg"
export const APPLINK = "https://github.com/k27dong/bamboo"

export const ENABLE_DONATION_LINK = true
export const DONATION_LINK = "https://www.buymeacoffee.com/kefan"

export enum EmbedColors {
  Error = 0xbf2121,
  Warning = 0xd95829,
  Success = 0x027333,
  Playing = 0xadbc67,
}

export const DISCORD_MESSAGE_CHAR_LIMIT = 1990
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
}

export enum LogLevel {
  Info = "info",
  Warn = "warn",
  Error = "error",
}

export const LOG_LEVEL_COLORS: Record<LogLevel, ChalkInstance> = {
  [LogLevel.Info]: chalk.green,
  [LogLevel.Warn]: chalk.yellow,
  [LogLevel.Error]: chalk.redBright,
}

export const LOG_TIME_ZONE = "America/Toronto"
export const LOG_TIME_FORMAT = new Intl.DateTimeFormat("en-CA", {
  timeZone: LOG_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
})
export const LOG_LEVEL_WIDTH = 5
export const LOG_COMMAND_WIDTH = 7
