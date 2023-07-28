Promise.prototype.ok_or_raise = async function (error) {
  let result = await this
  result = result.body

  if (result.code == 200) {
    return result.data
  } else {
    throw error
  }
}

module.exports = Promise
