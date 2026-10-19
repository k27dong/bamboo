import { spawn } from "child_process"
import { existsSync } from "fs"

const [environment, ...command] = process.argv.slice(2)

if (existsSync(".infisical.json")) {
  command.unshift("infisical", "run", `--env=${environment}`, "--silent", "--")
} else if (existsSync(".env")) {
  process.loadEnvFile(".env")
} else {
  console.error(
    "⚠️  No settings found. Copy .env.example to .env and fill it in, or link an Infisical project with `infisical init`.",
  )
  process.exit(1)
}

const [file, ...args] = command
if (file === undefined) throw new Error("No command to run")
const child = spawn(file, args, { stdio: "inherit" })
process.on("SIGINT", () => child.kill("SIGINT"))
process.on("SIGTERM", () => child.kill("SIGTERM"))
child.on("exit", (code) => process.exit(code ?? 1))
