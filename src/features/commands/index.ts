import type { Command } from "@/core/commands/Command"

import { Ping } from "./ping"
import { Play } from "./play"
import { Queue } from "./queue"

export const Commands: Command[] = [Ping, Play, Queue]
