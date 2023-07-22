const {
  login_qr_key,
  login_qr_create,
  login_qr_check,
} = require("NeteaseCloudMusicApi")
const { ok_or_raise } = require("../util/ok_or")

const login_qrcode = async () => {
  try {
    console.log(`Logging in ...`)

    let timestamp = Date.now()
    let qr_key = await login_qr_key().ok_or_raise("Failed to get QR key.")
    let base64 = await login_qr_create({
      key: qr_key.unikey,
      qrimg: true,
    }).ok_or_raise("Failed to create QR code.")

    /**
     * Todo: find a proper way to display qrcode and check login status
     */

    // timer = setInterval(async () => {
    //   const res = await login_qr_check({
    //     key: qr_key.unikey,
    //   }).ok_or_raise("Failed to check QR code.")

    //   /**
    //    * 800: QR code expired
    //    * 801: Waiting for scan
    //    * 802: Waiting for confirm
    //    * 803: Scan confirmed
    //    */

    // }, 3000)

    console.log("logged in")
  } catch (error) {
    console.error(error)
  }
}

exports.login_qrcode = login_qrcode
