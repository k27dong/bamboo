import esbuild from "esbuild"

const commonOptions = {
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  sourcemap: true,
  minify: process.env.NODE_ENV === "production",
  external: [
    "dotenv",
    "discord-player",
    "@discord-player/extractor",
    "discord.js",
    "discord-player-youtubei",
    "NeteaseCloudMusicApi",
    "openai",
    "topgg-autoposter",
  ],
  logLevel: "info",
}

// Build both the main bot and sharding manager
Promise.all([
  esbuild.build({
    ...commonOptions,
    entryPoints: ["src/Bamboo.ts"],
    outfile: "dist/Bamboo.js",
  }),
  esbuild.build({
    ...commonOptions,
    entryPoints: ["src/sharding.ts"],
    outfile: "dist/sharding.js",
  }),
]).catch(() => process.exit(1))
