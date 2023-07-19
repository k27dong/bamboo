const { cloudsearch } = require("NeteaseCloudMusicApi")
const { assert_query_res } = require("../helper")
const { real_ip } = require("../../config.json")

const search_album = async (keywords) => {
  let search_q = await cloudsearch({
    keywords: keywords,
    type: 10, // for album search
    realIP: real_ip,
  })

  assert_query_res(search_q)

  let result = []

  if (search_q.body.result.albumCount === 0) {
    return result
  }

  let raw_album = search_q.body.result.albums

  for (
    let i = 0;
    i <
    (search_q.body.result.albums.length > 25
      ? 25
      : search_q.body.result.albums.length);
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
