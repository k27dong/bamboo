require("dotenv").config()
const { song_url } = require("NeteaseCloudMusicApi")
const { assert_query_res } = require("../helper")

const get_song_url_by_id = async (id, cookie) => {
  let song_q = await song_url({
    id: id,
    cookie: cookie,
    realIP: process.env.REAL_IP,
  })

  assert_query_res(song_q)

  let url = song_q.body.data[0].url
  let err_code = song_q.body.data[0].code

  return [url, err_code]
}

exports.get_song_url_by_id = get_song_url_by_id
