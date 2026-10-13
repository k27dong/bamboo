import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test, { mock } from "node:test"

import type { Track } from "discord-player"

import { enterTempWorkingDir, recordNeteaseRequests } from "./support/netease"

const LOGIN =
  "MUSIC_U=LOGIN_TOKEN; Max-Age=15552000; Path=/; HTTPOnly;__csrf=CSRF; Path=/;NMTID=TRACKING_ID; Max-Age=315360000; Path=/"
const LOGIN_DEVICE_ID = "FA25A568EB55089BB7823630A18B5C43A705F579017CB1E43B85"

const APP_SERVER = "interface.music.163.com"
const APP_USER_AGENT = "NeteaseMusic 9.0.90/5038 (iPhone; iOS 16.2; zh_CN)"
const WEB_SERVER = "music.163.com"
const WEB_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0"

const workingDir = enterTempWorkingDir(LOGIN)
const sent = recordNeteaseRequests()
mock.method(console, "log", () => undefined)

const { ApiServiceType } = await import("@/common/constants")
const { setUpCookie } = await import("@/common/utils/cookie")
const { NeteaseService } = await import("@/core/api/services/netease")
const service = new NeteaseService(await setUpCookie(ApiServiceType.Netease))

const calls: {
  name: string
  run: () => Promise<unknown>
  requests: [server: string, path: string][]
}[] = [
  {
    name: "song search",
    run: () => service.getDefaultTrack("query"),
    requests: [[APP_SERVER, "/eapi/cloudsearch/pc"]],
  },
  {
    name: "album search",
    run: () => service.searchAlbum("query"),
    requests: [[APP_SERVER, "/eapi/cloudsearch/pc"]],
  },
  {
    name: "album songs",
    run: () => service.getAlbumById("1"),
    requests: [[WEB_SERVER, "/weapi/v1/album/1"]],
  },
  {
    name: "lyrics",
    run: () => service.getLyricById("1"),
    requests: [[APP_SERVER, "/eapi/song/lyric"]],
  },
  {
    name: "user search",
    run: () => service.searchUser("query"),
    requests: [[APP_SERVER, "/eapi/cloudsearch/pc"]],
  },
  {
    name: "user playlists",
    run: () => service.getUserPlaylists("1"),
    requests: [[WEB_SERVER, "/weapi/user/playlist"]],
  },
  {
    name: "playlist tracks",
    run: () => service.getUserPlaylistTracksById("1"),
    requests: [
      [APP_SERVER, "/eapi/v6/playlist/detail"],
      [WEB_SERVER, "/weapi/v3/song/detail"],
    ],
  },
  {
    name: "similar track",
    run: () => service.getSimilarTrack("1", []),
    requests: [[WEB_SERVER, "/weapi/v1/discovery/simiSong"]],
  },
  {
    name: "song link",
    run: () => service.getTrackUrl({ url: "1" } as Track),
    requests: [[APP_SERVER, "/eapi/song/enhance/player/url/v1"]],
  },
]

for (const call of calls) {
  await test(`${call.name} reaches NetEase as the logged-in iPhone app`, async () => {
    const before = sent.length
    await call.run()
    const requests = sent.slice(before)

    assert.deepEqual(
      requests.map((request) => [request.host, request.path]),
      call.requests,
    )
    for (const request of requests) {
      assert.equal(
        request.userAgent,
        request.host === APP_SERVER ? APP_USER_AGENT : WEB_USER_AGENT,
      )
      assert.equal(request.realIp, "116.25.146.177")
      assert.deepEqual(
        {
          os: request.cookie.os,
          appver: request.cookie.appver,
          osver: request.cookie.osver,
          channel: request.cookie.channel,
          deviceId: request.cookie.deviceId,
          MUSIC_U: request.cookie.MUSIC_U,
          NMTID: request.cookie.NMTID,
        },
        {
          os: "iPhone OS",
          appver: "9.0.90",
          osver: "16.2",
          channel: "distribution",
          deviceId: LOGIN_DEVICE_ID,
          MUSIC_U: "LOGIN_TOKEN",
          NMTID: "TRACKING_ID",
        },
      )
    }
  })
}

await test("a different login gets a different device id", async () => {
  fs.writeFileSync(
    path.join(workingDir, "cookies", "netease.cookie"),
    "MUSIC_U=ANOTHER_LOGIN_TOKEN; Path=/",
  )
  const cookie = await setUpCookie(ApiServiceType.Netease)
  const deviceId = /deviceId=([0-9A-F]{52})$/.exec(cookie)?.[1]

  assert.ok(deviceId)
  assert.notEqual(deviceId, LOGIN_DEVICE_ID)
})
