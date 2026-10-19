export enum Environment {
  Development = "development",
  Production = "production",
}

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

export const config: Readonly<{
  environment: Environment
  discord: {
    token: string
    applicationId: string
    ownerId: string
    devGuildId?: string
    supportServerId?: string
    supportChannelId?: string
  }
  netease: { realIp?: string; cookie?: string }
  openrouterApiKey: string
  topggToken?: string
}> = {
  environment:
    process.env.NODE_ENV === Environment.Production
      ? Environment.Production
      : Environment.Development,
  discord: {
    token: required("DISCORD_TOKEN"),
    applicationId: required("DISCORD_APPLICATION_ID"),
    ownerId: required("DISCORD_OWNER_ID"),
    devGuildId: process.env.DISCORD_DEV_SERVER_ID,
    supportServerId: process.env.DISCORD_SUPPORT_SERVER_ID,
    supportChannelId: process.env.DISCORD_SUPPORT_CHANNEL_ID,
  },
  netease: {
    realIp: process.env.NETEASE_REAL_IP,
    cookie: process.env.NETEASE_COOKIE,
  },
  openrouterApiKey: required("OPENROUTER_API_KEY"),
  topggToken: process.env.TOPGG_TOKEN,
}
