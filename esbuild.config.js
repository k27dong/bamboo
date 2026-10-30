import { spawnSync } from "node:child_process"
import { readFileSync } from "node:fs"

import esbuild from "esbuild"

const commitHash = () => {
  if (process.env.COMMIT_HASH) return process.env.COMMIT_HASH
  const git = spawnSync("git", ["rev-parse", "--short", "HEAD"], {
    encoding: "utf8",
  })
  return git.status === 0 ? git.stdout.trim() : "unknown"
}

const { version } = JSON.parse(readFileSync("package.json", "utf8"))

esbuild
  .build({
    entryPoints: ["src/shard.ts", "src/manager.ts"],
    outdir: "dist",
    bundle: true,
    platform: "node",
    target: "node26",
    format: "esm",
    sourcemap: true,
    minify: process.env.NODE_ENV === "production",
    define: {
      BAMBOO_VERSION: JSON.stringify(`${version} (${commitHash()})`),
    },
    external: [
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
