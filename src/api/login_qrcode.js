const {
  login_qr_key,
  login_qr_create,
  login_qr_check,
} = require("NeteaseCloudMusicApi")
const { ok_or_raise } = require("../util/ok_or")
const QRCode = require("qrcode")

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
const login_qrcode = async () => {
  try {
    console.log(`Logging in ...`)

    let cookie_res;
    let qr_key_res = await login_qr_key().ok_or_raise("Failed to get QR key.")
    let qr_code_res = await login_qr_create({
      key: qr_key_res.data.unikey,
    }).ok_or_raise("Failed to create QR code.")

    QRCode.toString(qr_code_res.data.qrurl,{type:'terminal'}, function (err, url) {
      console.log(url)
    })

    for (; true; ) {
      cookie_res = await login_qr_check({
        key: qr_key_res.data.unikey,
      });
      if (cookie_res.body.code === 803) {
        break;
      }
      // console.log(cookie_res.body.code)
    }

    return {
      cookie: cookie_res.body.cookie,
    }
  } catch (err) {
    console.error(err)
  }
}

exports.login_qrcode = login_qrcode
