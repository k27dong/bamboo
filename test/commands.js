const sinon = require("sinon")
const chai = require("chai")
const expect = chai.expect
chai.use(require("chai-sorted"))

require("dotenv").config()
const fs = require("node:fs")
const path = require("node:path")
const { Client, GatewayIntentBits, Guild } = require("discord.js")
const { build_interaction } = require("./mock/interaction")
const ping = require("../src/commands/ping")
const loop = require("../src/commands/loop")
const help = require("../src/commands/help")
const { get_internal_doc } = require("../src/docs/general_doc")

// prepare mocking environment
const command_path = path.join(__dirname, "../src/commands")
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
let preset_guild, preset_member
;(async () => {
  preset_guild = await client.guilds.fetch(guild_id)
  preset_member = await preset_guild.members.fetch(user_id)
})()

/**
 * todo: album, jump, leave, lyric, queue, shuffle, skip, stop, user
 * todo: resume, user, list
 */

describe("commands", () => {
  let interaction, reply_spy

  beforeEach(async () => {
    interaction = await build_interaction(
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
      preset_guild,
      preset_member,
    )

    interaction.client.queue = new Map()

    reply_spy = sinon.spy(interaction, "reply")
  })

  after(() => {
    client.destroy()

    reply_spy.restore()
  })

  describe("ping", () => {
    it("should reply with Pong!", async () => {
      await ping.execute(interaction)

      sinon.assert.calledOnce(reply_spy)
      sinon.assert.calledWith(reply_spy, "Pong!")
    })
  })

  describe("loop", () => {
    it("should toggle the loop state", async () => {
      await loop.execute(interaction)

      expect(interaction.client.queue.get(guild_id).looping).to.be.true
      sinon.assert.calledOnce(reply_spy)
      sinon.assert.calledWith(reply_spy, "单曲循环: **ON**")

      await loop.execute(interaction)

      expect(interaction.client.queue.get(guild_id).looping).to.be.false
      sinon.assert.calledTwice(reply_spy)
      sinon.assert.calledWith(reply_spy, "单曲循环: **OFF**")
    })
  })

  describe("help", () => {
    let get_stub

    beforeEach(() => {
      get_stub = sinon.stub(interaction.client.guilds.cache, "get").returns({
        channels: {
          cache: {
            get: sinon
              .stub()
              .returns({ createInvite: sinon.stub().resolves("fake invite") }),
          },
        },
      })
    })

    afterEach(() => {
      get_stub.restore()
    })

    it("should display the corresponding help message", async () => {
      for (const f of fs
        .readdirSync(command_path)
        .filter((file) => file.endsWith(".js"))) {
        const command = f.slice(0, -3)

        if (command === "cmd") continue

        interaction.options = {
          getString: sinon.stub().returns(command),
        }

        await help.execute(interaction)

        sinon.assert.calledWithMatch(reply_spy, get_internal_doc(command))
      }

      expect(
        interaction.client.guilds.cache.get().channels.cache.get().createInvite
          .called,
      ).to.be.true
    })

    it("should display the support server invitation", async () => {
      await help.execute(interaction)

      sinon.assert.calledWithMatch(reply_spy, "Support Server: fake invite")
    })
  })
})
