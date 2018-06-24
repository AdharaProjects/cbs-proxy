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

    return response.account.id
  } catch(err){
    console.log('ERROR with calling /api/getOmnibusAccountId:', err)
    return {
      result: false
    }
  }
}

// TODO: Add query parameters
async function accountSummary(sessionToken, accountId, queryParameters) {
  const uri = 'http://localhost:3022/api/self/accounts/' + accountId
  const options = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Session-Token': sessionToken
    }
  }
  try{
    const response = await (await fetch(uri, options)).json()

    return response
  } catch(err){
    console.log('ERROR with calling /cbs/transfers:', err)
    return {
      result: false
    }
  }
}

module.exports = {
  getOmnibusAccount,
  accountSummary,
  config,
}
