require("dotenv").config()
const { album } = require("NeteaseCloudMusicApi")
const { assert_query_res } = require("../helper")

const get_album_songs = async (al) => {
  let album_q = await album({
    id: al.id,
    realIP: process.env.REAL_IP,
  })

  assert_query_res(album_q)

  let result = album_q.body.songs
  let new_songs = []

  for (let i = 0; i < result.length; i++) {
    let new_song = {
      name: result[i].name,
      id: result[i].id,
      ar: {
        name: result[i].ar[0].name,
        id: result[i].ar[0].id,
      },
      al: {
        name: result[i].al.name,
        id: result[i].al.id,
      },
      source: "netease",
    }
    new_songs.push(new_song)
  }

  return new_songs
}

exports.get_album_songs = get_album_songs
