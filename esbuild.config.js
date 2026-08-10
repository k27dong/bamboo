import esbuild from "esbuild"

esbuild
  .build({
    entryPoints: ["src/Bamboo.ts", "src/sharding.ts"],
    outdir: "dist",
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
      "@neteasecloudmusicapienhanced/api",
      "openai",
      "topgg-autoposter",
    ],
    logLevel: "info",
  })
  .catch(() => process.exit(1))
