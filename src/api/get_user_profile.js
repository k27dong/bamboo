require("dotenv").config()
const { cloudsearch } = require("NeteaseCloudMusicApi")
const { ok_or_raise } = require("../util/ok_or")

const get_user_profile = async (name) => {
  let profile_data = await cloudsearch({
    keywords: name,
    type: 1002,
    realIP: process.env.REAL_IP,
  }).ok_or_raise("API Error in cloudsearch profile")

  return !profile_data.result.userprofiles
    ? null
    : profile_data.result.userprofiles[0]
}

exports.get_user_profile = get_user_profile
