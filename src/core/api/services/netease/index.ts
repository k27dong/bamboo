import type { Track } from "discord-player"

import type {
  BambooMusicApi,
  NeteaseAlbumDetailed,
  NeteasePlaylistSearchResult,
  NeteasePlaylistTracks,
  NeteaseSong,
  NeteaseUserProfile,
} from "@/core/api/interfaces"

import { getAlbumList } from "./getAlbumList"
import { getAlbumSongs } from "./getAlbumSongs"
import { getPlaylistsByUserId } from "./getPlaylistsByUserId"
import { getPlaylistTracks } from "./getPlaylistTracks"
import { getRawLyricById } from "./getRawLyricById"
import { getSongUrlByTrack } from "./getTrackUrl"
import { searchSong } from "./searchSong"
import { searchUser } from "./searchUser"

export class NeteaseService implements BambooMusicApi {
  private cookie?: string

  constructor(cookie?: string) {
    this.cookie = cookie
  }

  async getTrackUrl(track: Track): Promise<string> {
    return getSongUrlByTrack(track, this.cookie)
  }

  async getDefaultTrack(query: string): Promise<NeteaseSong | null> {
    return searchSong(query, this.cookie)
  }

  async searchAlbum(query: string): Promise<NeteaseAlbumDetailed[] | null> {
    return getAlbumList(query, this.cookie)
  }

  async getAlbumById(id: string): Promise<NeteaseSong[] | null> {
    return getAlbumSongs(id, this.cookie)
  }

  async getLyricById(id: string): Promise<string | null> {
    return getRawLyricById(id, this.cookie)
  }

  async searchUser(query: string): Promise<NeteaseUserProfile[] | null> {
    return searchUser(query, this.cookie)
  }

  async getUserPlaylists(
    query: string,
  ): Promise<NeteasePlaylistSearchResult[] | null> {
    return getPlaylistsByUserId(query, this.cookie)
  }

  async getUserPlaylistTracksById(
    id: string,
  ): Promise<NeteasePlaylistTracks | null> {
    return getPlaylistTracks(id, this.cookie)
  }
}
