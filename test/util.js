const chai = require("chai")
const sinon = require("sinon")
const expect = chai.expect
chai.use(require("chai-sorted"))

const { Client, GatewayIntentBits } = require("discord.js")
const { build_interaction } = require("./mock/interaction")
const {
  token,
  client_id,
  dev_guild,
  dev_channel_id,
  owner_id,
} = require("../config.json")

const {
  populate_info,
  assert_query_res,
  assert_channel_play_queue,
} = require("../src/helper")

// prepare mocking environment
const client = new Client({ intents: [GatewayIntentBits.Guilds] })
const application_id = client_id
const guild_id = dev_guild
const channel_id = dev_channel_id
const user_id = owner_id
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
client.login(token)

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
    command_id
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
      expect(res.voice_channel_id).to.be.null

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
})
