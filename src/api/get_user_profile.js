require("dotenv").config()
const { cloudsearch } = require("NeteaseCloudMusicApi")
const { assert_query_res } = require("../helper")

const get_user_profile = async (name) => {
  let search_q = await cloudsearch({
    keywords: name,
    type: 1002,
    realIP: process.env.REAL_IP,
  })

  assert_query_res(search_q)

  return !search_q.body.result.userprofiles
    ? null
    : search_q.body.result.userprofiles[0]
}

exports.get_user_profile = get_user_profile
