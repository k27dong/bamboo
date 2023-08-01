require("dotenv").config()
const { song_url } = require("NeteaseCloudMusicApi")
const { assert_query_res } = require("../helper")
const { ok_or_raise } = require("../util/ok_or")

const get_song_url_by_id = async (id, cookie) => {
  let song_url_data = await song_url({
    id: id,
    cookie: cookie,
    realIP: process.env.REAL_IP,
  }).ok_or_raise("API Error in song_url")

  let url = song_url_data.data[0].url
  let err_code = song_url_data.data[0].code

  return [url, err_code]
}

exports.get_song_url_by_id = get_song_url_by_id
