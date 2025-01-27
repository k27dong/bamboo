import type { Command } from "@/core/commands/Command"

import { Ping } from "./ping"
import { Play } from "./play"

export const Commands: Command[] = [Ping, Play]
