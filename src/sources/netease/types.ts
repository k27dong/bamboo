declare module "@neteasecloudmusicapienhanced/api" {
  interface RequestBaseConfig {
    domain?: string
  }
}

export type RawArtist = { name: string }

export type RawSong = {
  id: number
  name: string
  dt: number
  ar: RawArtist[]
  al: { picUrl: string }
}

export type RawSimilarSong = {
  id: number
  name: string
  duration: number
  artists: RawArtist[]
  album: { picUrl: string }
}

export type RawAlbum = {
  id: number
  name: string
  picUrl: string
  description: string
  publishTime: number
  size: number
  artists: RawArtist[]
}

export type RawUser = {
  userId: number
  nickname: string
  avatarUrl: string
}

export type RawPlaylist = {
  id: number
  name: string
  description: string | null
  coverImgUrl: string
  trackCount: number
  creator: RawUser
}

export type SongSearchAnswer = { result?: { songs?: RawSong[] } }
export type AlbumSearchAnswer = { result?: { albums?: RawAlbum[] } }
export type UserSearchAnswer = { result?: { userprofiles?: RawUser[] } }
export type SongUrlAnswer = { data?: { url: string | null }[] }
export type LyricAnswer = { lrc?: { lyric?: string } }
export type SimilarSongsAnswer = { songs?: RawSimilarSong[] }
export type AlbumAnswer = { album?: RawAlbum; songs?: RawSong[] }
export type UserPlaylistsAnswer = { playlist?: RawPlaylist[] }
export type PlaylistDetailAnswer = {
  playlist?: RawPlaylist & { trackIds: { id: number }[] }
}
export type SongDetailAnswer = { songs: RawSong[] }

export type QrKeyAnswer = { unikey: string }
export type QrCodeAnswer = { qrurl: string }
