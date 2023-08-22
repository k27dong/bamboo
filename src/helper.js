require("dotenv").config()
const axios = require("axios")
const { API_OK, MAX_MESSAGE_LENGTH, MAX_DESCRIPTION_LENGTH } = require("./common")

/**
 * Reads the interaction object from discord and parse it into
 * lightweight object
 *
 * @param {Object} interaction
 * @returns Info object with useful data structures
 */
const populate_info = (interaction) => {
  return {
    server_id: interaction.guildId,
    user_id: interaction.member.user.id,
    text_channel_id: interaction.channelId,
    voice_channel_id: interaction.guild.members.cache.get(
      interaction.member.user.id,
    ).voice.channelId,
  }
}

/**
 * Checks the query result, if the return code is not 200 throws error
 */
const assert_query_res = (res) => {
  if (res.status !== API_OK) throw `code ${res.status}`
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
  if (!lrc) {
    return code_block("No lyrics available")
  }

  /**
   * Regex explanation:
   * 1. remove timestamp from the beginning of each line ([mm:ss.xx] or [mm:ss.xxx])
   * 2. remove multiple spaces
   * 3. Add space after comma if there isn't one (a,b -> a, b)
   * 4. Add space after period if there isn't one (I.Robot -> I. Robot)
   */
  let sanitized = lrc
    .split("\n")
    .map((line) => line.replace(/\[\d{2}:\d{2}(\.\d{2,3})?]/, "").trim())
    .map((line) => line.replace(/\s+/g, " "))
    .map((line) => line.replace(/,([^\s\d])/g, ", $1"))
    .map((line) => line.replace(/\.([^\s\d.])/g, ". $1"))

  let lyric = ""

  for (
    let i = 0;
    i < sanitized.length &&
    lyric.length + sanitized[i].length < MAX_MESSAGE_LENGTH - 7;
    i++
  ) {
    lyric += sanitized[i] + "\n"
  }

  return code_block(lyric)
}

const send_msg_to_text_channel = (interaction, content) => {
  interaction.client.channels.cache.get(interaction.channelId).send(content)
}

const shuffle = (arr) => {
  let curr_index = arr.length

  while (curr_index !== 0) {
    const rand_index = Math.floor(Math.random() * curr_index)
    curr_index--
    ;[arr[curr_index], arr[rand_index]] = [arr[rand_index], arr[curr_index]]
  }

  return arr
}

const post_command_usage_update = (cmd) => {
  if (process.env.UPDATE_COMMAND_API) {
    axios
      .post(process.env.UPDATE_COMMAND_API, {
        command_name: cmd,
      })
      .catch((err) => {
        console.log(`update cmd err: ${err}`)
      })
  }
}

const post_server_list_update = (guild) => {
  if (process.env.UPDATE_SERVER_API) {
    axios
      .post(process.env.UPDATE_SERVER_API, {
        name: guild.name,
        id: guild.id,
        locale: guild.preferredLocale,
        member_count: guild.memberCount - 1,
        joined_time: time_convert(guild.joinedTimestamp),
      })
      .catch((err) => {
        console.log(`update cmd err: ${err}`)
      })
  }
}

const time_convert = (timestamp) => {
  const months = [
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

  const date_object = new Date(timestamp)
  const year = date_object.getUTCFullYear()
  const month = months[date_object.getUTCMonth()]
  const date = date_object.getUTCDate()

  return `${year}, ${month}, ${date}`
}

const code_block = (content) => {
  return "```" + content + "```"
}

const trim_description = (description) => {
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    description = description.substring(0, MAX_DESCRIPTION_LENGTH - 3) + "..."
  }

  return description
}

exports.populate_info = populate_info
exports.assert_query_res = assert_query_res
exports.assert_channel_play_queue = assert_channel_play_queue
exports.display_track = display_track
exports.send_msg_to_text_channel = send_msg_to_text_channel
exports.parse_lrc = parse_lrc
exports.shuffle = shuffle
exports.post_command_usage_update = post_command_usage_update
exports.post_server_list_update = post_server_list_update
exports.time_convert = time_convert
exports.code_block = code_block
exports.trim_description = trim_description
