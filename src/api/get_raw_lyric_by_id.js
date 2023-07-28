const { lyric } = require("NeteaseCloudMusicApi")
const { assert_query_res } = require("../helper")

const get_raw_lyric_by_id = async (id) => {
  let lyric_q = await lyric({
    id: id,
  })

  assert_query_res(lyric_q)

  return lyric_q.body.lrc.lyric
}

exports.get_raw_lyric_by_id = get_raw_lyric_by_id
