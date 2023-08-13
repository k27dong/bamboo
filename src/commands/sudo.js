const { SlashCommandBuilder } = require("discord.js")
const { time_convert, code_block } = require("../helper")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sudo")
    .setDescription("命令行")
    .addStringOption((option) =>
      option.setName("run").setDescription("commands").setRequired(true),
    ),
  async execute(interaction) {
    class Server {
      constructor(name, id, region, joined) {
        this.name = name
        this.id = id
        this.region = region
        this.joined = joined
      }
    }

    // check permission
    if (interaction.user.id !== process.env.OWNER_ID) {
      await interaction.reply("no permission")
      return
    }

    const command = interaction.options.getString("run").split(/\s+/)

    switch (command[0]) {
      case "ls":
        // list all guilds
        let table = []
        let count = 0

        interaction.client.guilds.cache.forEach((guild) => {
          table.push(
            new Server(
              guild.name,
              guild.id,
              guild.preferredLocale,
              guild.joinedTimestamp,
            ),
          )
          count += guild.memberCount
        })

        table.sort(function (a, b) {
          return a.joined - b.joined
        })

        for (let t of table) {
          t.joined = time_convert(t.joined)
        }

        console.table(table)
        console.log("TOTAL USERS: " + count)

        await interaction.reply(
          code_block(
            `Number of servers: ${table.length}\nTotal users: ${count}`,
          ),
        )
        break
      case "uptime":
        // display the uptime of the bot since last restart
        let total_seconds = interaction.client.uptime / 1000
        let days = Math.floor(total_seconds / 86400)
        total_seconds %= 86400
        let hours = Math.floor(total_seconds / 3600)
        total_seconds %= 3600
        let minutes = Math.floor(total_seconds / 60)
        let seconds = Math.floor(total_seconds % 60)

        let uptime = ""

        uptime += days ? `${days} days, ` : ""
        uptime += hours ? `${hours} hours, ` : ""
        uptime += minutes ? `${minutes} minutes, ` : ""
        uptime += seconds ? `${seconds} seconds` : ""

        await interaction.reply(`uptime: ${uptime}`)
        break
      case "reload":
        // reload all commands
        break
      default:
        // unknown commands
        await interaction.reply(`unknown command: \`${command[0]}\``)
    }
  },
}
