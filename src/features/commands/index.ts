import type { Command } from "@/core/commands/Command"

import { Album } from "./album"
import { Clear } from "./clear"
import { Jump } from "./jump"
import { Lyric } from "./lyric"
import { Ping } from "./ping"
import { Play } from "./play"
import { Queue } from "./queue"
import { Shuffle } from "./shuffle"
import { Skip } from "./skip"
import { User } from "./user"

export const Commands: Command[] = [
  Ping,
  Play,
  Queue,
  Skip,
  Album,
  Lyric,
  User,
  Shuffle,
  Jump,
  Clear,
]
