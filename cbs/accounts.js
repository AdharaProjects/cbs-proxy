const fetch = require('node-fetch')

const config = {
  apiServerAddress: 'http://localhost:4000'
}

async function getOmnibusAccount(sessionToken){
  const uri = config.apiServerAddress + '/api/self/accounts/organization/data-for-history'
  const options = {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Session-Token': sessionToken
    }
  }
  try{
    const response = await (await fetch(uri, options)).json()

    console.log(JSON.stringify(response, null, 2))
    return response.account.id
  } catch(err){
    console.log('ERROR with calling /api/getOmnibusAccountId:', err)
    return {
      result: false
    }
  }
}

module.exports = {
  getOmnibusAccount,
  config,
}
