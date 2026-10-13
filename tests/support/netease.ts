import fs from "node:fs"
import { createRequire } from "node:module"
import os from "node:os"
import path from "node:path"

export interface SentRequest {
  host: string
  path: string
  userAgent: string | undefined
  realIp: string | undefined
  cookie: Record<string, string>
}

interface Transport {
  defaults: {
    adapter: (config: {
      url: string
      headers: { toJSON: () => Record<string, unknown> }
    }) => Promise<unknown>
  }
}

const SONG = {
  name: "song",
  id: 1,
  dt: 1000,
  fee: 0,
  al: { id: 1, name: "album", picUrl: "", description: "" },
  ar: [{ id: 1, name: "artist" }],
  publishTime: 0,
}

const RESPONSES: [string, unknown][] = [
  [
    "/cloudsearch/pc",
    {
      code: 200,
      result: {
        songs: [SONG],
        songCount: 1,
        albums: [{ id: 1, name: "album", picUrl: "", artists: [] }],
        userprofiles: [{ userId: 1, nickname: "user", avatarUrl: "" }],
      },
    },
  ],
  [
    "/song/enhance/player/url/v1",
    { code: 200, data: [{ id: 1, url: "https://audio.invalid/1.mp3" }] },
  ],
  ["/v1/album/", { code: 200, songs: [SONG], album: SONG.al }],
  ["/song/lyric", { code: 200, lrc: { lyric: "[00:00.00]lyric" } }],
  ["/user/playlist", { code: 200, playlist: [{ id: 1, name: "playlist" }] }],
  [
    "/playlist/detail",
    { code: 200, playlist: { id: 1, name: "playlist", trackIds: [{ id: 1 }] } },
  ],
  ["/song/detail", { code: 200, songs: [SONG], privileges: [] }],
  ["/simiSong", { code: 200, songs: [SONG] }],
  ["/login/qrcode/unikey", { code: 200, unikey: "KEY" }],
  ["/login/qrcode/client/login", { code: 803 }],
]

const QR_LOGIN_SET_COOKIE = [
  "MUSIC_U=NEW_LOGIN; Max-Age=1; Path=/; Domain=.music.163.com",
  "NMTID=NEW_TRACKING_ID; Path=/; Domain=.music.163.com",
]

export const enterTempWorkingDir = (savedLogin?: string) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bamboo-test-"))
  fs.writeFileSync(
    path.join(dir, ".env.development"),
    "TOKEN=test\nAPPLICATION_ID=1\nDEV_GUILD=1\nOWNER_ID=1\nREAL_IP=116.25.146.177\n",
  )
  if (savedLogin) {
    fs.mkdirSync(path.join(dir, "cookies"))
    fs.writeFileSync(path.join(dir, "cookies", "netease.cookie"), savedLogin)
  }
  process.chdir(dir)
  return dir
}

export const recordNeteaseRequests = () => {
  const require = createRequire(import.meta.url)
  const libraryDir = path.dirname(
    fs.realpathSync(require.resolve("@neteasecloudmusicapienhanced/api")),
  )
  const transport = (
    require(require.resolve("axios", { paths: [libraryDir] })) as {
      default: Transport
    }
  ).default
  const sent: SentRequest[] = []

  transport.defaults.adapter = (config) => {
    const url = new URL(config.url)
    const headers = Object.fromEntries(
      Object.entries(config.headers.toJSON()).map(([name, value]) => [
        name.toLowerCase(),
        String(value),
      ]),
    )
    const cookie = Object.fromEntries(
      (headers.cookie ?? "")
        .split(/;\s*/)
        .filter(Boolean)
        .map((pair) => {
          const [name, ...value] = pair.split("=")
          return [decodeURIComponent(name), decodeURIComponent(value.join("="))]
        }),
    )
    sent.push({
      host: url.host,
      path: url.pathname,
      userAgent: headers["user-agent"],
      realIp: headers["x-real-ip"],
      cookie,
    })

    const response = RESPONSES.find(([suffix]) => url.pathname.includes(suffix))
    return Promise.resolve({
      data: response?.[1] ?? { code: 200 },
      status: 200,
      statusText: "OK",
      headers: url.pathname.endsWith("/login/qrcode/client/login")
        ? { "set-cookie": QR_LOGIN_SET_COOKIE }
        : {},
      config,
      request: {},
    })
  }

  return sent
}
