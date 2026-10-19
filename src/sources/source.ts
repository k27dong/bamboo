export enum SourceId {
  Netease = "netease",
}

export type Song = {
  id: string
  title: string
  artist: string
  durationMs: number
  thumbnail: string
  url: string
}

export type Album = {
  id: string
  title: string
  artist: string
  songCount: number
  publishedAt: number
  description: string
  thumbnail: string
  url: string
}

export type User = {
  id: string
  name: string
}

export type Playlist = {
  id: string
  title: string
  description: string
  songCount: number
  thumbnail: string
  ownerName: string
  ownerAvatar: string
  url: string
}

export interface MusicSource {
  id: SourceId
  searchSongs(query: string): Promise<Song[]>
  getStreamUrl(song: Song): Promise<string>
  findRelated?(song: Song, played: Song[]): Promise<Song | null>
  getLyrics?(song: Song): Promise<string | null>
  albums?: {
    search(query: string): Promise<Album[]>
    getSongs(album: Album): Promise<Song[]>
  }
  users?: {
    search(query: string): Promise<User[]>
    getPlaylists(user: User): Promise<Playlist[]>
    getPlaylistSongs(playlist: Playlist): Promise<Song[]>
  }
}

export const isLink = (text: string) =>
  /^(?:https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(text)
