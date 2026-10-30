declare module "@neteasecloudmusicapienhanced/api" {
  interface RequestBaseConfig {
    domain?: string
    timeout?: number
  }
}

export type NeteaseArtist = { name: string }

export type NeteaseSong = {
  id: number
  name: string
  dt: number
  ar?: NeteaseArtist[]
  al?: { picUrl: string }
}

export type NeteaseSimilarSong = {
  id: number
  name: string
  duration: number
  artists?: NeteaseArtist[]
  album?: { picUrl: string }
}

export type NeteaseAlbum = {
  id: number
  name: string
  picUrl: string
  description: string | null
  publishTime: number
  size: number
  artists: NeteaseArtist[]
}

export type NeteaseAlbumWithArtist = NeteaseAlbum & {
  artists: [NeteaseArtist, ...NeteaseArtist[]]
}

export type NeteaseUser = {
  userId: number
  nickname: string
  avatarUrl: string
}

export type NeteasePlaylist = {
  id: number
  name: string
  description: string | null
  coverImgUrl: string
  trackCount: number
  creator?: NeteaseUser
}

export type SongSearchAnswer = { result?: { songs?: NeteaseSong[] } }
export type AlbumSearchAnswer = { result?: { albums?: NeteaseAlbum[] } }
export type UserSearchAnswer = { result?: { userprofiles?: NeteaseUser[] } }
export type SongUrlAnswer = { data?: { url: string | null }[] }
export type LyricAnswer = { lrc?: { lyric?: string } }
export type SimilarSongsAnswer = { songs?: NeteaseSimilarSong[] }
export type AlbumAnswer = { album?: NeteaseAlbum; songs?: NeteaseSong[] }
export type UserPlaylistsAnswer = { playlist?: NeteasePlaylist[] }
export type PlaylistDetailAnswer = {
  playlist?: NeteasePlaylist & { trackIds: { id: number }[] }
}
export type SongDetailAnswer = { songs: NeteaseSong[] }

export type QrKeyAnswer = { unikey: string }
export type QrCodeAnswer = { qrurl: string }
