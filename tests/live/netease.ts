import fs from "node:fs"

import NeteaseCloudMusicApi from "@neteasecloudmusicapienhanced/api"
import type { Track } from "discord-player"

import { ApiServiceType } from "@/common/constants"
import { setUpCookie } from "@/common/utils/cookie"
import { NeteaseService } from "@/core/api/services/netease"

const FULL_TRACK_KBPS = 96

if (!fs.existsSync("cookies/netease.cookie")) {
  console.error(
    "No saved NetEase login at cookies/netease.cookie. Run the bot once to log in.",
  )
  process.exit(1)
}

const cookie = await setUpCookie(ApiServiceType.Netease)
const service = new NeteaseService(cookie)

let failures = 0
const check = (name: string, passed: boolean, detail: string) => {
  if (!passed) failures++
  console.log(`${passed ? "PASS" : "FAIL"}  ${name}  ${detail}`)
}

const login = (await NeteaseCloudMusicApi.login_status({ cookie })).body as {
  data?: { profile?: { userId?: number; vipType?: number } }
}
check(
  "saved login is valid",
  !!login.data?.profile?.userId,
  `vipType=${login.data?.profile?.vipType}`,
)

const song = await service.getDefaultTrack("海阔天空 Beyond")
check("song search", !!song?.id, `${song?.name} id=${song?.id}`)

const link = song
  ? await service.getTrackUrl({ url: String(song.id) } as Track)
  : ""
check("song link", !!link, link ? new URL(link).host : "no link")

if (song && link) {
  const audio = await fetch(link, { headers: { Range: "bytes=0-65535" } })
  const downloaded = (await audio.arrayBuffer()).byteLength
  const totalBytes = Number(audio.headers.get("content-range")?.split("/")[1])
  const kbps = Math.round((totalBytes * 8) / song.dt)
  check("audio downloads", downloaded > 0, `${audio.status} ${downloaded}B`)
  check(
    "audio is the full track, not a trial clip",
    kbps >= FULL_TRACK_KBPS,
    `${kbps} kbit/s over ${Math.round(song.dt / 1000)}s`,
  )
}

const lyric = song ? await service.getLyricById(String(song.id)) : ""
check("lyrics", !!lyric && lyric.length > 50, `length=${lyric?.length}`)

const albums = await service.searchAlbum("叶惠美")
check("album search", !!albums?.length, `count=${albums?.length}`)

const albumSongs = albums?.length
  ? await service.getAlbumById(String(albums[0].id))
  : null
check("album songs", !!albumSongs?.length, `count=${albumSongs?.length}`)

const users = await service.searchUser("周杰伦")
check("user search", !!users?.length, `count=${users?.length}`)

const playlists = users?.length
  ? await service.getUserPlaylists(String(users[0].userId))
  : null
check("user playlists", !!playlists?.length, `count=${playlists?.length}`)

const playlist = playlists?.length
  ? await service.getUserPlaylistTracksById(String(playlists[0].id))
  : null
check(
  "playlist tracks",
  !!playlist?.tracks.length,
  `count=${playlist?.tracks.length}`,
)

const similar = song ? await service.getSimilarTrack(String(song.id), []) : null
check("similar track", !!similar?.id, `${similar?.name}`)

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILED`)
process.exit(failures === 0 ? 0 : 1)
