const fs = require("node:fs")
const path = require("node:path")
const { HELPER_DESCRIPTION_WIDTH } = require("../common")

const get_internal_doc = (cmd) => {
  const append_space = (num) => {
    let empty_spaces = ""
    for (let i = 0; i < num; i++) empty_spaces += " "
    return empty_spaces
  }

  const customized_helper_msg = (cmd) => {
    switch (cmd) {
      case "album":
        return "在选项中填入专辑名，在返回的列表中选择专辑，专辑中的所有歌曲会自动加到播放列表的末尾。"
      case "clear":
        return "清空队列中所有歌曲，停止目前正在播放的歌曲(用queue查看)。"
      case "jump":
        return "用queue来显示队列，在选项中填入序号，直接开始播放该序号的歌曲。"
      case "lyric":
        return "显示当前正在播放歌曲的歌词"
      case "play":
        return "在选项中填入搜索信息，播放搜索到的歌曲。"
      case "queue":
        return "显示当前播放队列，可以在选项中填入想显示的数量。"
      case "skip":
        return "切歌。"
      case "help":
        return 'He asked me what Beatles album he should pick up, and I told him "Dude, you need to get Help."'
      default:
        return "Can't find the helper message for this command"
    }
  }

  let cmd_list = "完整指令列表：\n\n"
  let cmd_helper_msg = {}
  const cmd_path = path.join(__dirname, "../commands")

  for (const f of fs
    .readdirSync(cmd_path)
    .filter((file) => file.endsWith(".js"))) {
    const file_path = path.join(cmd_path, f)
    const command = require(file_path)

    if (command.data.name === "ping" || command.data.name === "cmd") continue

    cmd_list += `${command.data.name}${append_space(
      HELPER_DESCRIPTION_WIDTH - command.data.name.length,
    )}${command.data.description}\n`

    cmd_helper_msg[command.data.name] =
      `${command.data.name} | ${command.data.description}\n\n` +
      customized_helper_msg(cmd)
  }

  return !cmd
    ? cmd_list
    : !!cmd_helper_msg[cmd]
      ? cmd_helper_msg[cmd]
      : `Can't find the command: ${cmd}`
}

exports.get_internal_doc = get_internal_doc
