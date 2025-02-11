export interface Credentials {
  TOKEN: string
  APPLICATION_ID: string
  DEV_GUILD: string
  OWNER_ID: string
  DEV_CHANNEL_ID?: string
  REAL_IP?: string
  OPENAI_API_KEY?: string
  SUPPORT_SERVER_ID?: string
  SUPPORT_SERVER_CHANNEL_ID?: string
}

export type DeployScope = "dev" | "global"

export interface QRKeyResponse {
  code: number
  unikey: string
}

export interface QRCodeResponse {
  qrurl: string
  qrimg: string
}

export interface QRCheckResponse {
  code: number
  cookie: string
}

export interface StatGuildsRecord {
  name: string;
  id: string;
  joinedTimeClean: string;
}
