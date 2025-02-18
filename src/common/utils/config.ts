import dotenv from "dotenv"
import fs from "fs"
import path from "path"

import type { Credentials, Environment } from "@/env"

const NODE_ENV: Environment =
  process.env.NODE_ENV === "production" ? "production" : "development"
const envFilePath = path.resolve(process.cwd(), `.env.${NODE_ENV}`)

if (!fs.existsSync(envFilePath)) {
  throw new Error(`⚠️  .env file not found for environment: ${NODE_ENV}`)
}

dotenv.config({ path: envFilePath })

const config: Credentials = {
  TOKEN: process.env.TOKEN!,
  APPLICATION_ID: process.env.APPLICATION_ID!,
  DEV_GUILD: process.env.DEV_GUILD!,
  OWNER_ID: process.env.OWNER_ID!,
  DEV_CHANNEL_ID: process.env.DEV_CHANNEL_ID!,
  REAL_IP: process.env.REAL_IP!,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
  SUPPORT_SERVER_ID: process.env.SUPPORT_SERVER_ID!,
  SUPPORT_SERVER_CHANNEL_ID: process.env.SUPPORT_SERVER_CHANNEL_ID!,
  TOPGG_TOKEN: process.env.TOPGG_TOKEN!,
  ENVIROMENT: NODE_ENV,
}

export const TOKEN = config.TOKEN
export const APPLICATION_ID = config.APPLICATION_ID
export const DEV_GUILD = config.DEV_GUILD
export const OWNER_ID = config.OWNER_ID
export const DEV_CHANNEL_ID = config.DEV_CHANNEL_ID
export const REAL_IP = config.REAL_IP
export const OPENAI_API_KEY = config.OPENAI_API_KEY
export const SUPPORT_SERVER_ID = config.SUPPORT_SERVER_ID
export const SUPPORT_SERVER_CHANNEL_ID = config.SUPPORT_SERVER_CHANNEL_ID
export const TOPGG_TOKEN = config.TOPGG_TOKEN
export const ENVIROMENT = config.ENVIROMENT
export const CREDENTIALS = config
