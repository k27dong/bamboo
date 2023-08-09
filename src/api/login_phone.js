/**
 * !Deprecated: this login method is no longer support due to a change
 * !made by NetEase.
 */

const { login_cellphone } = require("NeteaseCloudMusicApi")

const login_phone = async (phone, country, pwd) => {
  console.log(`Logging in ...`)

  let login_q = await login_cellphone({
    phone: phone,
    countrycode: country,
    password: pwd,
  })

  if (login_q.body.code === 200) {
    console.log(`logged in.`)
    console.log(`User: ${login_q.body.profile.nickname}`)
    return login_q.body
  } else {
    console.log(`Default login error: code ${login_q.body.code}\n`)
  }
}

exports.login_phone = login_phone
