import type { Command } from "@/core/commands/Command"

import { Album } from "./album"
import { Back } from "./back"
import { Clear } from "./clear"
import { Exit } from "./exit"
import { Help } from "./help"
import { Jump } from "./jump"
import { Lyric } from "./lyric"
import { Pause } from "./pause"
import { Ping } from "./ping"
import { Play } from "./play"
import { Queue } from "./queue"
import { Shuffle } from "./shuffle"
import { Skip } from "./skip"
import { Sudo } from "./sudo"
import { User } from "./user"
import { Clean } from "./clean"

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
  Exit,
  Back,
  Sudo,
  Help,
  Pause,
  Clean,
]
