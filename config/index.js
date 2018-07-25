const fs = require('fs')
const path = require('path')
const configPath = process.env.CONFIG_PATH || './config/config.json'
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))

module.exports = {
  apiServerPort: process.env.API_SERVER_PORT || config.apiServerPort,
  cbsApiAddress: process.env.CBS_SERVER_ADDRESS || config.cbsApiAddress,
}

console.log("\nDEFAULT CONFIGURATION:", path.resolve(configPath))
console.log()
console.log("RUNNING WITH CONFIGURATION:\n")
console.log(module.exports)
console.log()
