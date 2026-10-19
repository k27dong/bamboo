import type { Command as ClientCommand } from "@/core/commands/Command"
import { Album } from "@/features/commands/album"
import { User } from "@/features/commands/user"

import { Back } from "./back"
import { Clear } from "./clear"
import type { Command } from "./command"
import { Exit } from "./exit"
import { Help } from "./help"
import { Jump } from "./jump"
import { Loop } from "./loop"
import { Lyric } from "./lyric"
import { Pause } from "./pause"
import { Ping } from "./ping"
import { Play } from "./play"
import { Queue } from "./queue"
import { Shuffle } from "./shuffle"
import { Skip } from "./skip"
import { Sudo } from "./sudo"

const adapt = (command: ClientCommand): Command => ({
  data: command.data,
  manual: command.manual,
  run: ({ interaction }) => command.run(interaction.client, interaction),
})

export const commands: readonly Command[] = [
  Ping,
  Play,
  Queue,
  Skip,
  adapt(Album),
  Lyric,
  adapt(User),
  Shuffle,
  Jump,
  Clear,
  Exit,
  Back,
  Sudo,
  Help,
  Pause,
  Loop,
]
