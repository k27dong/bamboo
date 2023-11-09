const sinon = require("sinon")
const chai = require("chai")
const expect = chai.expect
chai.use(require("chai-sorted"))
chai.use(require("chai-as-promised"))

require("dotenv").config()
const fs = require("node:fs")
const path = require("node:path")
const { Client, GatewayIntentBits } = require("discord.js")
const { build_interaction } = require("./mock/interaction")
const ping = require("../src/commands/ping")
const loop = require("../src/commands/loop")
const help = require("../src/commands/help")
const back = require("../src/commands/back")
const clear = require("../src/commands/clear")
const leave = require("../src/commands/leave")
const jump = require("../src/commands/jump")
const skip = require("../src/commands/skip")
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
const mock_reply = async () => {}
const mock_defer_reply = async () => {}
const mock_edit_reply = async () => {}
const mock_follow_up = async () => {}
const mock_delete_reply = async () => {}
const options = []
const command_id = "1234"
client.login(process.env.TOKEN).then(() => {
  console.log("client successfully logged in in test environment")
})
let preset_guild, preset_member
;(async () => {
  preset_guild = await client.guilds.fetch(guild_id)
  preset_member = await preset_guild.members.fetch(user_id)
})()

/**
 * Todo:
 *  album, list, play
 *  queue, resume, search, shuffle, stop, user
 */

const get_queue = (interaction) => {
  return interaction.client.queue.get(guild_id)
}

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

  afterEach(() => {
    sinon.restore()
  })

  after(() => {
    client.destroy()
  })

  describe("ping", () => {
    it("should reply with Pong!", async () => {
      await ping.execute(interaction)

      sinon.assert.calledOnce(reply_spy)
      sinon.assert.calledWith(
        reply_spy,
        sinon.match(
          (string) => string.includes("Pong"),
          "expected to include 'Pong'",
        ),
      )
    })
  })

  describe("loop", () => {
    it("should toggle the loop state", async () => {
      await loop.execute(interaction)

      expect(interaction.client.queue.get(guild_id).looping).to.be.true
      sinon.assert.calledOnce(reply_spy)
      sinon.assert.calledWith(reply_spy, "列表循环: **ON**")

      await loop.execute(interaction)

      expect(interaction.client.queue.get(guild_id).looping).to.be.false
      sinon.assert.calledTwice(reply_spy)
      sinon.assert.calledWith(reply_spy, "列表循环: **OFF**")
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

  describe("back", () => {
    it("should decrease the position by 1", async () => {
      interaction.client.queue.set(guild_id, {
        playing: false,
        position: 2,
        player: {},
      })

      await back.execute(interaction)

      expect(get_queue(interaction).position).to.equal(1)
      expect(get_queue(interaction).playing).to.equal(true)
      sinon.assert.calledOnce(reply_spy)
      sinon.assert.calledWith(reply_spy, "done")
    })

    it("should not decrease the position if it is 0", async () => {
      interaction.client.queue.set(guild_id, {
        playing: false,
        position: 0,
        player: {},
      })

      await back.execute(interaction)

      expect(get_queue(interaction).position).to.equal(0)
      expect(get_queue(interaction).playing).to.equal(true)
      sinon.assert.calledOnce(reply_spy)
      sinon.assert.calledWith(reply_spy, "done")
    })

    it("should reply with error message if the queue is empty", async () => {
      interaction.client.queue.set(guild_id, {
        playing: true,
        position: 2,
        player: undefined,
      })

      await back.execute(interaction)

      expect(interaction.client.queue.get(guild_id).position).to.equal(2)
      sinon.assert.calledOnce(reply_spy)
      sinon.assert.calledWith(reply_spy, "Nothing is playing")
    })
  })

  describe("clear", () => {
    it("should clear the queue", async () => {
      interaction.client.queue.set(guild_id, {
        playing: true,
        position: 3,
        player: undefined,
        track: [1, 2, 3],
      })

      await clear.execute(interaction)

      expect(get_queue(interaction).position).to.equal(-1)
      expect(get_queue(interaction).playing).to.equal(false)
      expect(get_queue(interaction).player).to.equal(undefined)

      sinon.assert.calledOnce(reply_spy)
      sinon.assert.calledWith(reply_spy, "done")
    })
  })

  describe("leave", () => {
    let queue, stop_spy, destroy_spy

    beforeEach(() => {
      queue = {
        playing: true,
        position: 3,
        player: { stop: sinon.spy() },
        connection: { destroy: sinon.spy() },
      }

      interaction.client.queue.set(guild_id, queue)

      stop_spy = queue.player.stop
      destroy_spy = queue.connection.destroy
    })

    it("should leave the voice channel", async () => {
      await leave.execute(interaction)

      expect(interaction.client.queue.get(guild_id)).to.equal(undefined)

      sinon.assert.calledOnce(reply_spy)
      sinon.assert.calledWith(reply_spy, "done")
    })

    it("should clear the queue and stop the player", async () => {
      await leave.execute(interaction)

      sinon.assert.calledOnce(stop_spy)
      sinon.assert.calledOnce(destroy_spy)
    })
  })

  describe("jump", () => {
    beforeEach(() => {
      interaction.client.queue.set(guild_id, {
        track: [{ name: "Track 1" }, { name: "Track 2" }, { name: "Track 3" }],
        position: 0,
        playing: true,
      })

      interaction.options = {
        getInteger: sinon.stub(),
      }
    })

    it("should reply with the current track if the new position is the current one", async () => {
      interaction.options.getInteger.returns(1)

      await jump.execute(interaction)

      sinon.assert.calledOnce(reply_spy)
      sinon.assert.calledWith(reply_spy, "1 is playing!")
    })

    it("should throw an error if the new position is invalid", async () => {
      interaction.options.getInteger.returns(-1)

      await expect(jump.execute(interaction)).to.be.rejectedWith(
        "-1 is not a valid index to jump to",
      )
    })

    it("should change the position and start playing the new track", async () => {
      interaction.options.getInteger.returns(3)

      await jump.execute(interaction)

      const queue = interaction.client.queue.get(interaction.guildId)
      expect(queue.position).to.equal(2)

      expect(reply_spy.calledOnce).to.be.true
      expect(reply_spy.calledWith("jumped to: Track 3")).to.be.true
    })
  })

  describe("skip", () => {
    it("should reply with 'End of queue.' when at the end of the queue without looping", async () => {
      interaction.client.queue.set(interaction.guildId, {
        player: { stop: sinon.spy() },
        track: [{ name: "Track 1" }, { name: "Track 2" }],
        position: 1,
        playing: true,
        looping: false,
      })

      await skip.execute(interaction)

      sinon.assert.calledWith(reply_spy, "End of queue.")
      sinon.assert.calledOnce(
        interaction.client.queue.get(interaction.guildId).player.stop,
      )
      expect(
        interaction.client.queue.get(interaction.guildId).position,
      ).to.equal(-1)
    })

    it("should increment position and play next track when not at end of queue", async () => {
      interaction.client.queue.set(interaction.guildId, {
        player: { stop: sinon.stub() },
        track: [{ name: "Track 1" }, { name: "Track 2" }, { name: "Track 3" }],
        position: 0,
        playing: true,
        looping: false,
      })

      await skip.execute(interaction)

      sinon.assert.calledWith(reply_spy, "done")
      expect(
        interaction.client.queue.get(interaction.guildId).position,
      ).to.equal(1)
    })

    it("should reply with 'Nothing is playing' when there is no player", async () => {
      interaction.client.queue.set(interaction.guildId, {
        player: null,
        track: [{ name: "Track 1" }, { name: "Track 2" }],
        position: 0,
        playing: true,
        looping: false,
      })

      await skip.execute(interaction)

      sinon.assert.calledWith(reply_spy, "Nothing is playing")
      expect(interaction.client.queue.get(interaction.guildId).playing).to.be
        .true
    })
  })
})
