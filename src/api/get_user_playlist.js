require("dotenv").config()
const { user_playlist } = require("NeteaseCloudMusicApi")
const { ok_or_raise } = require("../util/ok_or")

const get_user_playlist = async (id) => {
  let playlist_data = await user_playlist({
    uid: id,
    realIP: process.env.REAL_IP,
  }).ok_or_raise("API Error in user_playlist")

  let playlist = []

  // due to the change in the api, the following check is no longer necessary
  // since there will always be a default playlist 'xxx喜欢的音乐'
  // if (!playlist_q.body.playlist.length === 0) {
  //   return playlist
  // }

  // edge case: user has no playlist but only the default playlist
  // somehow there exist two format of default playlist, this is to handle the old one
  // in case the creator is null, the call is simply rejected for now.
  if (
    playlist_data.playlist.length === 1 &&
    playlist_data.playlist[0].name.includes("我喜欢的音乐") &&
    playlist_data.playlist[0].creator === null
  ) {
    return playlist
  }

  for (let p of playlist_data.playlist) {
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
