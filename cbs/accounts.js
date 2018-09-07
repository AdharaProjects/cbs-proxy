const fetch = require('node-fetch')
const queryString = require('query-string')

const config = require('../config')

async function getPrimaryAccount(sessionToken){
  const uri = config.cbsApiAddress + '/api/self/accounts/organization/data-for-history'//?fields=id'
  const options = {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Session-Token': sessionToken
    }
  }
  try{
    const response = await (await fetch(uri, options)).json()

    // If the user not the *admin* they will not be able to get the id type
    if (!!response.account) {
      return response.account.id
    } else {
      const userUri = config.cbsApiAddress + '/api/self/accounts'//?fields=id'
      const userResponse = await (await fetch(userUri, options)).json()
      return userResponse[0].id
    }
  } catch(err){
    console.log('ERROR with calling /api/getPrimaryAccountId:', err)
    return {
      result: false
    }
  }
}

async function getAccountsList(sessionToken) {
  const uri = config.cbsApiAddress + '/api/self/accounts'
  const options = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Session-Token': sessionToken
    }
  }
  try {
    const response = await (await fetch(uri, options)).json()

    return response
  } catch(err) {
    console.log('ERROR with calling /api/self/accounts:', err)
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
  getPrimaryAccount,
  getAccountsList,
  accountSummary,
  config,
}
