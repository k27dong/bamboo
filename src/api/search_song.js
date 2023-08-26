require("dotenv").config()
const { cloudsearch } = require("NeteaseCloudMusicApi")

const search_song = async (keywords) => {
  let song_data = await cloudsearch({
    keywords: keywords,
    realIP: process.env.REAL_IP,
  }).ok_or_raise("API Error in cloudsearch song")

  const query = song_data.result.songs
  const res = []

  if (!query) return

  for (let i = 0; i < Math.min(20, query.length); i++) {
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
