const { cloudsearch } = require("NeteaseCloudMusicApi")
const { assert_query_res } = require("../helper")
const { real_ip } = require("../../config.json")

const search_song = async (keywords) => {
  let search_q = await cloudsearch({
    keywords: keywords,
    realIP: real_ip,
  })

  assert_query_res(search_q)

  const query = search_q.body.result.songs
  const res = []

  if (!query) return

  for (let i = 0; i < Math.min(10, query.length); i++) {
    res.push({
      name: query[i].name,
      id: query[i].id,
      ar: {
        name: query[i].ar[0].name,
        id: query[i].ar[0].id,
      },
      al: {
        name: query[i].al.name,
        id: query[i].al.id,
      },
      source: "netease",
    })
  }

  return res
}

exports.search_song = search_song
