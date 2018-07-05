const fs = require('fs')
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'))

module.exports = {
  apiServerPort: process.env.API_SERVER_PORT || config.apiServerPort,
  cbsApiAddress: process.env.CBS_SERVER_ADDRESS || config.cbsApiAddress,
}
