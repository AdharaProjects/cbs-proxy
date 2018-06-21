const fetch = require('node-fetch')

const config = {
  apiServerAddress: 'http://localhost:4000'
}

async function getAuth(username, password){
  const credentials = username+':'+password
  const base64Credentials = Buffer.from(credentials).toString('base64')
  const uri = config.apiServerAddress + '/api/auth/session?fields=sessionToken'
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic '+base64Credentials
    }
  }
  try{
    const response = await (await fetch(uri, options)).json()

    return response.sessionToken
  } catch(err){
    console.log('ERROR with calling /api/auth:', err)
    return {
      result: false
    }
  }
}

module.exports = {
  getAuth,
  config,
}
