const axios = require("axios")
const { update_server_api, update_command_api } = require("../config.json")

/**
 * Reads the interaction object from discord and parse it into
 * lightweight object
 *
 * @param {Object} interaction
 * @returns Info object with useful data structures
 */
const populate_info = (interaction) => {
  let info = {
    server_id: interaction.guildId,
    user_id: interaction.member.user.id,
    text_channel_id: interaction.channelId,
    voice_channel_id: interaction.guild.members.cache.get(
      interaction.member.user.id,
    ).voice.channelId,
  }

  return info
}

/**
 * Checks the query result, if the return code is not 200 throws error
 * @param {Query} res
 */
const assert_query_res = (res) => {
  if (res.status != 200) throw `code ${res.status}`
}

const create_queue = (interaction) => {
  let queue = {
    text_channel: interaction.channelId,
    voice_channel: interaction.member.voice.channel,
    track: [],
    volume: 80,
    playing: false,
    looping: false,
    connection: null,
    player: null,
    user: null,
    position: -1,
  }

  interaction.client.queue.set(interaction.guildId, queue)
}

const assert_channel_play_queue = (interaction) => {
  if (!interaction.client.queue.get(interaction.guildId)) {
    create_queue(interaction)
  }

  return interaction.client.queue.get(interaction.guildId)
}

const display_track = (track) => {
  if (track.length === 0) {
    return "```Track empty!```"
  }

  let queue = "```"
  let maxed = false
  let i = 0

  for (; i < track.length; i++) {
    let item = track[i].song
    let new_line = `${track[i].pos + 1}) ${item.name} ${
      !!item.ar.name ? `(${item.ar.name})` : ""
    }${track[i].curr ? `   ◄———— \n` : `\n`}`

    if (queue.length + new_line.length >= 1990) {
      maxed = true
      break
    }

    queue += new_line
  }

  if (maxed) {
    queue += `${track[i].pos + 1}) ...`
  }

  queue += "```"

  return queue
}

const parse_lrc = (lrc) => {
  if (typeof lrc === "undefined") {
    return "```No lyrics available```"
  }

  let sanitized = lrc.split("\n")
  for (let i = 0; i < sanitized.length; i++) {
    let l = sanitized[i]
    try {
      if (l.length >= 0 && l[0] == "[") {
        sanitized[i] = sanitized[i].slice(sanitized[i].indexOf("]") + 1)
      }
    } catch (err) {
      console.log(err)
    }
  }

  let parsed = "```"
  for (let i = 0; i < sanitized.length; i++) {
    if (parsed.length < 1985) {
      parsed += sanitized[i] + "\n"
    }
  }
  parsed += "```"

  return parsed
}

const send_msg_to_text_channel = (interaction, content) => {
  interaction.client.channels.cache.get(interaction.channelId).send(content)
}

const shuffle = (array) => {
  var curr_index = array.length,
    temp_value,
    ran_index

  while (0 !== curr_index) {
    ran_index = Math.floor(Math.random() * curr_index)
    curr_index -= 1

    temp_value = array[curr_index]
    array[curr_index] = array[ran_index]
    array[ran_index] = temp_value
  }

  return array
}

const post_command_usage_update = (cmd) => {
  if (update_command_api) {
    axios
      .post(update_command_api, {
        command_name: cmd,
      })
      .catch((err) => {
        console.log(`update cmd err: ${err}`)
      })
  }
}

const post_server_list_update = (guild) => {
  if (update_server_api) {
    axios
      .post(update_server_api, {
        name: guild.name,
        id: guild.id,
        locale: guild.preferredLocale,
        member_count: guild.memberCount,
        joined_time: time_convert(guild.joinedTimestamp),
      })
      .catch((err) => {
        console.log(`update cmd err: ${err}`)
      })
  }
}

const time_convert = (timestamp) => {
  var a = new Date(timestamp)
  var months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]
  var year = a.getFullYear()
  var month = months[a.getMonth()]
  var date = a.getDate()

  let time = year + ", " + month + ", " + date
  return time
}

exports.populate_info = populate_info
exports.assert_query_res = assert_query_res
exports.assert_channel_play_queue = assert_channel_play_queue
exports.display_track = display_track
exports.send_msg_to_text_channel = send_msg_to_text_channel
exports.parse_lrc = parse_lrc
exports.shuffle = shuffle
exports.post_command_usage_update = post_command_usage_update
exports.time_convert = time_convert
exports.post_server_list_update = post_server_list_update
