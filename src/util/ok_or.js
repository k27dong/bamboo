const { API_OK } = require("../common")

Promise.prototype.ok_or_raise = async function (error) {
  let result = await this

  if (result.body.code === API_OK && result.status === API_OK) {
    return result.body
  } else {
    throw `(${result.status}): ${error}`
  }
}

module.exports = Promise
