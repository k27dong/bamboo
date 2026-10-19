import { exec } from "child_process"
import { readFile } from "fs/promises"
import { resolve } from "path"
import { promisify } from "util"

import type { PackageJson } from "@/common/types"

const execAsync = promisify(exec)

// Version Info System
let versionInfo = "Version: Not initialized"

/**
 * Initializes version information from package.json and git commit hash
 * @example
 * await initializeVersion()
 * getVersion() // "```1.2.3 (a1b2c3d)```"
 */
export const initializeVersion = async () => {
  try {
    const packageJsonPath = resolve(process.cwd(), "package.json")
    const contents = await readFile(packageJsonPath, "utf8")
    const packageJson: PackageJson = JSON.parse(contents)

    const commitHash =
      process.env.COMMIT_HASH ||
      (await execAsync("git rev-parse --short HEAD")
        .then(({ stdout }) => stdout.trim())
        .catch((error) => {
          console.error("Failed to get git commit hash:", error)
          return "unknown"
        }))

    versionInfo = `${packageJson.version} (${commitHash})`
  } catch (error) {
    console.error("Version initialization failed:", error)
    versionInfo = "Version: Unavailable"
  }
}

/**
 * Returns formatted version information
 * @returns Version string
 * @example
 * getVersion() // "1.2.3 (a1b2c3d)"
 */
export const getVersion = () => versionInfo
