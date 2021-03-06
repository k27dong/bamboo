const {
  assert_channel_play_queue,
  populate_info,
  send_msg_to_text_channel,
} = require("./helper")
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require("@discordjs/voice")
const { get_song_url_by_id } = require("./api/netease/get_song_url_by_id")
const { API_OK, ERR_UNPAID, ERR_COPYRIGHT } = require("./common")

const play = async (interaction) => {
  try {
    let queue = assert_channel_play_queue(interaction)
    let info = populate_info(interaction)

    if (queue.track.length == 0) {
      send_msg_to_text_channel(interaction, `Nothing to play!`)
    }

    if (!queue.player) {
      queue.player = createAudioPlayer()
      queue.player.on(AudioPlayerStatus.Playing, () => {
        console.log("Playing starts")
      })

      queue.player.on(AudioPlayerStatus.Idle, async () => {
        console.log("here idle")
        console.log(queue.playing)
        if (queue.playing) {
          if (!queue.looping && queue.position >= queue.track.length - 1) {
            queue.playing = false
            send_msg_to_text_channel(interaction, `End of queue.`)
            queue.position = -1
            queue.player.stop()
          } else {
            queue.position = queue.looping
              ? (queue.position + 1) % queue.track.length
              : queue.position + 1

            let resource = await next_resource(interaction)
            if (process.env.DEBUG_F) console.log("Playing from #1:")
            if (!!resource) queue.player.play(resource)
          }
        }
      })
    }

    if (!queue.connection) {
      queue.connection = joinVoiceChannel({
        channelId: info.voice_channel_id,
        guildId: info.server_id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      })

      queue.connection.subscribe(queue.player)
    }

    let resource = await next_resource(interaction)
    if (process.env.DEBUG_F) console.log("Playing from #2:")
    if (!!resource) queue.player.play(resource)
  } catch (err) {
    console.log(err)
    send_msg_to_text_channel(interaction, err)
  }
}

const next_resource = async (interaction) => {
  let queue = assert_channel_play_queue(interaction)
  let cookie = interaction.client.cookie

  if (queue.track.length == 0) {
    send_msg_to_text_channel(interaction, `Nothing to play!`)
    queue.playing = false
    queue.player.stop()
  }

  let url, err_code
  let play_message = ""
  let curr_song = queue.track[queue.position]

  if (curr_song.source === "netease") {
    ;[url, err_code] = await get_song_url_by_id(curr_song.id, cookie)
    play_message = `Playing: ${queue.track[queue.position].name} (${
      queue.track[queue.position].ar.name
    })`
  } else {
    send_msg_to_text_channel(
      interaction,
      `Sources from ${curr_song.source} is not supported yet!`
    )
  }

  if (err_code === API_OK) {
    send_msg_to_text_channel(interaction, play_message)
    console.log(url)

    // url = "https://download.samplelib.com/mp3/sample-3s.mp3"
    return createAudioResource(url)
  } else {
    console.log("url invalid: ", err_code)

    if (curr_song.source === "netease") {
      let invalid_reason =
        err_code === ERR_UNPAID
          ? "????????????"
          : err_code === ERR_COPYRIGHT
          ? "?????????"
          : "????????????"

      send_msg_to_text_channel(
        interaction,
        `Invalid song: ${curr_song.name} (${invalid_reason})`
      )
    } else {
      send_msg_to_text_channel(interaction, "Invalid song")
    }

    if (!queue.looping && queue.position >= queue.track.length - 1) {
      queue.playing = false
      send_msg_to_text_channel(interaction, `End of queue.`)
      queue.position = -1
      return null
    } else {
      queue.position = queue.looping
        ? (queue.position + 1) % queue.track.length
        : queue.position + 1
      return next_resource(interaction)
    }
  }
}

exports.play = play
