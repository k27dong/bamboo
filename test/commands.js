const { Client, GatewayIntentBits } = require("discord.js")
const { build_interaction } = require("./mock/interaction")
const {
  token,
  client_id,
  dev_guild,
  dev_channel_id,
  owner_id,
} = require("../config.json")
const ping = require("../src/commands/ping")

const sinon = require("sinon")
const chai = require("chai")
const expect = chai.expect
chai.use(require("chai-sorted"))

// prepare mocking environment
const client = new Client({ intents: [GatewayIntentBits.Guilds] })
const application_id = client_id
const guild_id = dev_guild
const channel_id = dev_channel_id
const user_id = owner_id
const type = 2
const name = "album" //
const subcommand = "search" //
const mock_reply = async (res) => {}
const mock_defer_reply = async (res) => {}
const mock_edit_reply = async (res) => {}
const mock_follow_up = async (res) => {}
const mock_delete_reply = async (res) => {}
const options = []
const command_id = "1234"
client.login(token)

describe("commands", () => {
  after(() => {
    client.destroy()
  })

  describe("ping", () => {
    it("should reply with Pong!", async () => {
      const interaction = await build_interaction(
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

      const spy = sinon.spy(interaction, "reply")

      await ping.execute(interaction)

      sinon.assert.calledOnce(spy)
      sinon.assert.calledWith(spy, "Pong!")

      spy.restore()
    })
  })
})
