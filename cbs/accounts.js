const fetch = require('node-fetch')
const queryString = require('query-string')

const config = require('../config.js')

async function getOmnibusAccount(sessionToken){
  const uri = config.cbsApiAddress + '/api/self/accounts/organization/data-for-history'
  const options = {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Session-Token': sessionToken
    }
  }
  try{
    const response = await (await fetch(uri, options)).json()

    // console.log(JSON.stringify(response, null, 2))
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
  const stringifiedParameters = queryString.stringify({...queryParameters})
  const uri = config.cbsApiAddress + '/api/self/accounts/' + accountId + '?' + stringifiedParameters
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
