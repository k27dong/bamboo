require("dotenv").config()
const { playlist_detail, song_detail } = require("NeteaseCloudMusicApi")

const get_songs_from_playlist = async (list) => {
  let playlist_q = await playlist_detail({
    id: list.id,
    realIP: process.env.REAL_IP,
  })

  let raw_songs = []
  let id_chunks = []
  let songs = []

  if (playlist_q.body.code === 404) {
    return raw_songs
  }

  raw_songs = playlist_q.body.playlist.trackIds

  while (raw_songs.length > 0) {
    id_chunks.push(raw_songs.splice(0, 999))
  }

  for (let temp = 0; temp < id_chunks.length; temp++) {
    let curr_ids = id_chunks[temp]
    let ids = ""

    for (let i = 0; i < curr_ids.length; i++) {
      if (i === 0) {
        ids += `${curr_ids[i].id}`
      } else {
        ids += `,${curr_ids[i].id}`
      }
    }

    let songs_q = await song_detail({
      ids: ids,
      realIP: process.env.REAL_IP,
    })

    if (!songs_q.body.songs || songs_q.body.songs.length === 0) {
      return songs
    }

    for (let s of songs_q.body.songs) {
      songs.push({
        name: s.name,
        id: s.id,
        ar: {
          name: s.ar[0].name,
          id: s.ar[0].id,
        },
        al: {
          name: s.al.name,
          id: s.al.id,
        },
        source: "netease",
      })
    }
  }

  return songs
}

exports.get_songs_from_playlist = get_songs_from_playlist
