const fs = require('fs')
const config = require('./config.json')

module.exports = {
  apiServerPort: process.env.API_SERVER_PORT || config.apiServerPort,
  cbsApiAddress: process.env.CBS_SERVER_ADDRESS || config.cbsApiAddress,
}
