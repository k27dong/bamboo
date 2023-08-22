/**
 * ERR CODE (maybe more to add):
 * 200: OK
 * 404: 无版权
 * -110: 未付款
 */
const API_OK = 200

const ERR_UNPAID = -110
const ERR_COPYRIGHT = 404
const ERR_NOT_FOUND = 404
const ERR_SERVER_ERROR = 500

const STATUS_EXPIRED = 800
const STATUS_WAITING = 801
const STATUS_CONFIRM = 802
const STATUS_CONFIRMED = 803

const HELPER_DESCRIPTION_WIDTH = 10
const SUPPORT_SERVER_SERVER = "966754695123177554"
const SUPPORT_SERVER_CHANNEL = "966754695123177557"

const MAX_MESSAGE_LENGTH = 2000
const MAX_DESCRIPTION_LENGTH = 100

const PORT = process.env.PORT || 53881

exports.API_OK = API_OK
exports.ERR_UNPAID = ERR_UNPAID
exports.ERR_COPYRIGHT = ERR_COPYRIGHT
exports.ERR_NOT_FOUND = ERR_NOT_FOUND
exports.ERR_SERVER_ERROR = ERR_SERVER_ERROR
exports.STATUS_EXPIRED = STATUS_EXPIRED
exports.STATUS_WAITING = STATUS_WAITING
exports.STATUS_CONFIRM = STATUS_CONFIRM
exports.STATUS_CONFIRMED = STATUS_CONFIRMED
exports.HELPER_DESCRIPTION_WIDTH = HELPER_DESCRIPTION_WIDTH
exports.SUPPORT_SERVER_SERVER = SUPPORT_SERVER_SERVER
exports.SUPPORT_SERVER_CHANNEL = SUPPORT_SERVER_CHANNEL
exports.MAX_MESSAGE_LENGTH = MAX_MESSAGE_LENGTH
exports.MAX_DESCRIPTION_LENGTH = MAX_DESCRIPTION_LENGTH
exports.PORT = PORT
