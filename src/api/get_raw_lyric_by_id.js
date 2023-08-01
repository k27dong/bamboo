require("dotenv").config()
const { lyric } = require("NeteaseCloudMusicApi")
const { ok_or_raise } = require("../util/ok_or")

const get_raw_lyric_by_id = async (id) => {
  let lyric_data = await lyric({
    id: id,
    realIP: process.env.REAL_IP,
  }).ok_or_raise("API Error in lyric")

  return lyric_data.lrc.lyric
}

exports.get_raw_lyric_by_id = get_raw_lyric_by_id
