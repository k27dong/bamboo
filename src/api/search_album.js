require("dotenv").config()
const { cloudsearch } = require("NeteaseCloudMusicApi")
const { ok_or_raise } = require("../util/ok_or")

const search_album = async (keywords) => {
  let album_data = await cloudsearch({
    keywords: keywords,
    type: 10,
    realIP: process.env.REAL_IP,
  }).ok_or_raise("API Error in cloudsearch album")

  let result = []

  if (album_data.result.albumCount === 0) {
    return result
  }

  let raw_album = album_data.result.albums

  for (
    let i = 0;
    i <
    (album_data.result.albums.length > 25
      ? 25
      : album_data.result.albums.length);
    i++
  ) {
    let temp_obj = {
      name: raw_album[i].name,
      id: raw_album[i].id,
      size: raw_album[i].size,
      pic: raw_album[i].picUrl,
      date: raw_album[i].publishTime,
      ar: raw_album[i].artists[0].name,
    }

    result.push(temp_obj)
  }

  return result.sort((a, b) => b.date - a.date)
}

exports.search_album = search_album
