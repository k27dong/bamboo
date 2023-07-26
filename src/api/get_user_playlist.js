const { user_playlist } = require("NeteaseCloudMusicApi")
const { real_ip } = require("../../config.json")

const get_user_playlist = async (id) => {
  let playlist_q = await user_playlist({
    uid: id,
    realIP: real_ip,
  })

  let playlist = []

  if (!playlist_q.body.playlist.length === 0) {
    return playlist
  }

  for (let p of playlist_q.body.playlist) {
    if (p.creator.userId === id) {
      playlist.push({
        name: p.name,
        id: p.id,
        play_count: p.playCount,
        count: p.trackCount,
        cover_img: p.coverImgUrl,
      })
    }
  }

  return playlist
}

exports.get_user_playlist = get_user_playlist
