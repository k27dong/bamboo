import type { Credentials, Environment } from "@/env"

const NODE_ENV: Environment =
  process.env.NODE_ENV === "production" ? "production" : "development"

const required = (name: string) => {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `⚠️  Missing setting ${name}. Set it in your .env file or your Infisical project.`,
    )
  }
  return value
}

process.env.DOTENV_CONFIG_QUIET = "true"

const config: Credentials = {
  TOKEN: required("DISCORD_TOKEN"),
  APPLICATION_ID: required("DISCORD_APPLICATION_ID"),
  OWNER_ID: required("DISCORD_OWNER_ID"),
  DEV_GUILD: process.env.DISCORD_DEV_SERVER_ID,
  SUPPORT_SERVER_ID: process.env.DISCORD_SUPPORT_SERVER_ID,
  SUPPORT_SERVER_CHANNEL_ID: process.env.DISCORD_SUPPORT_CHANNEL_ID,
  REAL_IP: process.env.NETEASE_REAL_IP,
  NETEASE_COOKIE: process.env.NETEASE_COOKIE,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  TOPGG_TOKEN: process.env.TOPGG_TOKEN,
  ENVIROMENT: NODE_ENV,
}

export const TOKEN = config.TOKEN
export const APPLICATION_ID = config.APPLICATION_ID
export const OWNER_ID = config.OWNER_ID
export const DEV_GUILD = config.DEV_GUILD
export const SUPPORT_SERVER_ID = config.SUPPORT_SERVER_ID
export const SUPPORT_SERVER_CHANNEL_ID = config.SUPPORT_SERVER_CHANNEL_ID
export const REAL_IP = config.REAL_IP
export const NETEASE_COOKIE = config.NETEASE_COOKIE
export const OPENAI_API_KEY = config.OPENAI_API_KEY
export const TOPGG_TOKEN = config.TOPGG_TOKEN
export const ENVIROMENT = config.ENVIROMENT
