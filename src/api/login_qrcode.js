const {
  login_qr_key,
  login_qr_create,
  login_qr_check,
} = require("NeteaseCloudMusicApi")
const QRCode = require("qrcode")
const { STATUS_CONFIRMED, STATUS_EXPIRED } = require("../common")
const { ok_or_raise } = require("../util/ok_or")

/**
 * For now since Netease had remove the support for email & phone login, the
 * only way to login is via QR Code.
 *
 * The login process implemented for now is as follows:
 *  1. Get a QR key
 *  2. display the qr key on terminal (using a third party library)
 *  3. wait for user to scan the QR code
 *  4. once the QR code is scanned, the server will return a cookie
 *  5. use the cookie to login
 *
 * Todo:
 *  - implement a way to login via phone, or wait until Netease add support
 *  - optimize the response code checking process
 *  - the current method does not have any resiliency for failure, as someone
 *    needs to manually scan the QR code on a mobile device every time the
 *    program is restarted.
 *
 * The possible response codes for qr_check are:
 *  800: QR code expired
 *  801: waiting for scan
 *  802: waiting for confirm
 *  803: scan confirmed (cookie returned)
 */

const MAX_DURATION = 60 * 1000 // 1 min

const login_qrcode = async () => {
  try {
    console.log(`Logging in ...`)

    let qr_key_res = await login_qr_key().ok_or_raise("Failed to get QR key.")
    let qr_code_res = await login_qr_create({
      key: qr_key_res.data.unikey,
    }).ok_or_raise("Failed to create QR code.")

    QRCode.toString(
      qr_code_res.data.qrurl,
      { type: "terminal" },
      function (err, url) {
        console.log(url)
      },
    )

    let cookie_res
    let is_done = false
    let elapsed = 0

    const interval = setInterval(async () => {
      if (is_done || elapsed >= MAX_DURATION) {
        clearInterval(interval)
        return
      }

      cookie_res = await login_qr_check({
        key: qr_key_res.data.unikey,
      })

      if (cookie_res.body.code === STATUS_CONFIRMED) {
        is_done = true
        clearInterval(interval)
      } else if (cookie_res.body.code === STATUS_EXPIRED) {
        clearInterval(interval)
      }

      elapsed += 1000
    }, 1000) // check every second

    // wait until the QR code is scanned or expired
    while (!is_done && elapsed < MAX_DURATION) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    return is_done ? cookie_res.body.cookie : null
  } catch (err) {
    console.error(err)
    return null
  }
}

exports.login_qrcode = login_qrcode
