import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test, { mock } from "node:test"

import { enterTempWorkingDir, recordNeteaseRequests } from "./support/netease"

const ISSUED_LOGIN =
  "MUSIC_U=NEW_LOGIN; Max-Age=1; Path=/;;NMTID=NEW_TRACKING_ID; Path=/;"
const ISSUED_LOGIN_DEVICE_ID =
  "5C731425BC8C87146B099F3B780CBB6B6FF3F47917D5916F4840"
const CLIENT = {
  os: "iPhone OS",
  appver: "9.0.90",
  osver: "16.2",
  channel: "distribution",
}

const workingDir = enterTempWorkingDir()
const sent = recordNeteaseRequests()
mock.method(console, "log", () => undefined)

const { ApiServiceType } = await import("@/common/constants")
const { setUpCookie } = await import("@/common/utils/cookie")

await test("QR login asks NetEase as the iPhone app and keeps only what NetEase issued", async () => {
  const cookie = await setUpCookie(ApiServiceType.Netease)

  assert.deepEqual(
    sent.map((request) => [request.host, request.path]),
    [
      ["interface.music.163.com", "/eapi/login/qrcode/unikey"],
      ["interface.music.163.com", "/eapi/login/qrcode/client/login"],
    ],
  )
  for (const request of sent) {
    assert.deepEqual(
      {
        os: request.cookie.os,
        appver: request.cookie.appver,
        osver: request.cookie.osver,
        channel: request.cookie.channel,
      },
      CLIENT,
    )
    assert.match(request.cookie.deviceId, /^[0-9A-F]{52}$/)
    assert.equal(request.cookie.MUSIC_U, undefined)
  }
  assert.equal(
    fs.readFileSync(path.join(workingDir, "cookies", "netease.cookie"), "utf8"),
    ISSUED_LOGIN,
  )
  assert.equal(
    cookie,
    `${ISSUED_LOGIN}; os=iPhone OS; appver=9.0.90; osver=16.2; channel=distribution; deviceId=${ISSUED_LOGIN_DEVICE_ID}`,
  )
})
