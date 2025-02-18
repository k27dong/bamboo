import esbuild from "esbuild"

esbuild
  .build({
    entryPoints: ["src/Bamboo.ts"],
    bundle: true,
    platform: "node",
    target: "node22",
    format: "esm",
    outfile: "dist/Bamboo.js",
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
  })
  .catch(() => process.exit(1))
