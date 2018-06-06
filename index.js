const rp = require('request-promise-native')
const config = {
  apiServerAddress: 'http://localhost:4000'
}

async function getAuth(username, password){
  const credentials = username+':'+password
  const base64Credentials = Buffer.from(credentials).toString('base64')
  const options = {
    method: 'GET',
    uri: config.apiServerAddress + '/api/auth',
    json: true,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic '+base64Credentials
    }
  }
  try{
    let response = await rp(options)
    return response
  } catch(err){
    console.log('ERROR with calling /api/auth:', err)
    return {
      result: false
    }
  }
}

module.exports = {
  getAuth,
  config
}
