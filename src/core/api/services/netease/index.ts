import type { BambooMusicApi } from "@/core/api/interfaces"

import { searchSong } from "./searchSong"

export class NeteaseService implements BambooMusicApi {
  private cookie?: string

  constructor(cookie?: string) {
    this.cookie = cookie
  }

  async search(query: string): Promise<any> {
    const result = await searchSong(query, this.cookie)

    return result
  }
}
