const chai = require("chai")
const sinon = require("sinon")
const expect = chai.expect
chai.use(require("chai-sorted"))

require("dotenv").config()
const { Client, GatewayIntentBits } = require("discord.js")
const { build_interaction } = require("./mock/interaction")

const {
  populate_info,
  assert_query_res,
  assert_channel_play_queue,
  display_track,
  parse_lrc, shuffle, time_convert,
} = require("../src/helper")

// prepare mocking environment
const client = new Client({ intents: [GatewayIntentBits.Guilds] })
const application_id = process.env.CLIENT_ID
const guild_id = process.env.DEV_GUILD
const channel_id = process.env.DEV_CHANNEL_ID
const user_id = process.env.OWNER_ID
const type = 2
const name = "album"
const subcommand = "search"
const mock_reply = async (res) => {}
const mock_defer_reply = async (res) => {}
const mock_edit_reply = async (res) => {}
const mock_follow_up = async (res) => {}
const mock_delete_reply = async (res) => {}
const options = []
const command_id = "1234"
client.login(process.env.TOKEN)

const default_interaction = async () => {
  return await build_interaction(
    client,
    application_id,
    guild_id,
    channel_id,
    user_id,
    type,
    name,
    subcommand,
    mock_reply,
    mock_defer_reply,
    mock_edit_reply,
    mock_follow_up,
    mock_delete_reply,
    options,
    command_id,
  )
}

describe("util", () => {
  after(() => {
    client.destroy()
  })

  describe("populate_info", () => {
    it("should return the info object with the correct type of values", async () => {
      const interaction = await default_interaction()
      const res = await populate_info(interaction)

      expect(res).to.be.an("object")
      expect(res.server_id).to.be.a("string")
      expect(res.user_id).to.be.a("string")
      expect(res.text_channel_id).to.be.a("string")

      expect(res.server_id).to.equal(guild_id)
      expect(res.user_id).to.equal(user_id)
      expect(res.text_channel_id).to.equal(channel_id)
    })
  })

  describe("assert_query_res", () => {
    it("should throw error if the query is not returned with 200", async () => {
      const res = { status: 404 }
      expect(() => assert_query_res(res)).to.throw("code 404")
    })

    it("should not throw error if the query is returned with 200", async () => {
      const res = { status: 200 }
      expect(() => assert_query_res(res)).to.not.throw()
    })
  })

  describe("assert_channel_play_queue", () => {
    let interaction

    beforeEach(async () => {
      interaction = await default_interaction()
      interaction.client.queue = new Map()
    })

    it("should set a new queue if not existed", async () => {
      expect(interaction.client.queue.get(interaction.guildId)).to.be.undefined

      const result = assert_channel_play_queue(interaction)

      expect(interaction.client.queue.get(interaction.guildId)).to.exist
      expect(result).to.equal(interaction.client.queue.get(interaction.guildId))
      expect(result).to.be.an("object")
    })

    it("should return the queue if existed", async () => {
      const mock_queue = { name: "mocked queue" }
      interaction.client.queue.set(interaction.guildId, mock_queue)

      const result = assert_channel_play_queue(interaction)

      expect(result).to.equal(mock_queue)
    })
  })

  describe("display_track", () => {
    it("should notify if the track is empty", () => {
      const track = []

      const res = display_track(track)

      expect(res).to.be.a("string")
      expect(res).to.equal("```Track empty!```")
    })

    it("should return a string contains all the track", async () => {
      const track = [
        {
          song: {
            name: "告别的年代",
            id: 109236,
            ar: { name: "罗大佑" },
            al: {},
            source: "netease",
          },
          pos: 0,
          curr: true,
        },
        {
          song: {
            name: "沉默的表示",
            id: 109243,
            ar: { name: "罗大佑" },
            al: {},
            source: "netease",
          },
          pos: 1,
          curr: false,
        },
        {
          song: {
            name: "爱人同志",
            id: 109246,
            ar: { name: "罗大佑" },
            al: {},
            source: "netease",
          },
          pos: 2,
          curr: false,
        },
      ]

      const res = display_track(track)

      expect(res).to.be.a("string")
      expect(res.length).to.be.greaterThan(50)
    })
  })

  describe("parse_lrc", () => {
    it("should return the default message if the input is empty", () => {
      const res = parse_lrc(undefined)

      expect(res).to.be.a("string")
      expect(res).to.equal("```No lyrics available```")
    })

    it("should parse raw lyrics into a string", () => {
      const raw_lyc = `\n[00:00.00] 作词 : 吴晟\n[00:01.00] 作曲 : 罗大佑\n[05:01.19]古早的 古早的 古早以前\n[05:10.97]世世代代的祖公\n[05:15.36]就在这片长不出荣华富贵长不出奇迹的土地上\n[05:34.62]挥洒咸咸的汗水\n[05:42.28]播下粒粒的种籽\n[05:48.25]繁衍他们那无所谓而认命的子孙`

      const res = parse_lrc(raw_lyc)

      expect(res).to.be.a("string")

      const lines = res.split("\n")
      expect(lines.length).to.equal(10)
      expect(lines[3]).to.equal("古早的 古早的 古早以前")
      expect(lines[4]).to.equal("世世代代的祖公")
      expect(lines[5]).to.equal("就在这片长不出荣华富贵长不出奇迹的土地上")
      expect(lines[8]).to.equal("繁衍他们那无所谓而认命的子孙")
    })
  })

  describe("shuffle", () => {
    it("should change the order of the array", () => {
      const array = [1, 2, 3, 4, 5];
      const shuffled = shuffle([...array]);
      expect(shuffled).to.not.deep.equal(array);
    })
  })

  describe("time_convert", () => {
    it('should return the correct date string', () => {
      const timestamp = Date.UTC(2023, 6, 18);
      const result = time_convert(timestamp);
      expect(result).to.equal('2023, Jul, 18');
    });
  })
})
