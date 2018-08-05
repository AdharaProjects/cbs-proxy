const fs = require('fs')
const config = require('./config.json')

module.exports = {
  cbsUnameAdmin: process.env.ADMIN_UNAME || config.cbsUnameAdmin,
  cbsPasswordAdmin: process.env.ADMIN_PASSWORD || config.cbsPasswordAdmin,
  cbsUnameUser1: process.env.USER1_UNAME || config.cbsUnameUser1,
  cbsAccountIdUser1: process.env.USER1_ACCOUNT_ID || config.cbsAccountIdUser1,
  cbsPasswordUser1: process.env.USER1_PASSWORD || config.cbsPasswordUser1,
}
