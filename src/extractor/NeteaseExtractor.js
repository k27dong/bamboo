const { BaseExtractor, Track } = require("discord-player")

module.exports = class NeteaseExtractor extends BaseExtractor {
  static identifier = "netease-extractor"

  activate = async () => {
    // nothing to do here
  }

  deactivate = async () => {
    // nothing to do here
  }

  validate = async (query, type) => {
    console.log("validate: ", query, type)
    return true
  }

  handle = async (query, context) => {
    console.log("handle: ", query, context)
    return {
      playlist: null,
      tracks: [
        new Track(this.context.player, {
          title: "test_title",
          raw: "test",
          description: "test_description",
          author: "test_author",
          url: "test_url",
          requestedBy: context.requestedBy,
        }),
      ],
    }
  }

  stream = async (track) => {
    console.log("stream: ", track)

    let raw_url =
      "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3"
    return raw_url
  }
}
