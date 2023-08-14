const express = require("express")
const { PORT } = require("../common")

const alive = () => {
  const app = express()

  app.get("/health", (req, res) => res.send("OK"))

  app.listen(PORT, () => {
    console.log(`Health check server listening on port ${PORT}`)
  })
}

exports.alive = alive
