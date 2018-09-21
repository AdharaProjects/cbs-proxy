const fetch = require('node-fetch')
const queryString = require('query-string')
const SSEChannel = require('sse-pubsub')

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
      console.log({response})
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

async function getUserId(sessionToken){
  const options = {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Session-Token': sessionToken
    }
  }
  try{
    const userUri = config.cbsApiAddress + '/api/users/self'//?fields=id'
    const userResponse = await (await fetch(userUri, options)).json()
    return userResponse.id
  } catch(err){
    console.log('ERROR with calling /api/getUserId:', err)
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

async function watchForCbsBalanceChanges(channel, sessionToken) {
  const accountDetails = await getAccountsList(sessionToken)

  channel.publish(accountDetails, 'accountDetails')

  setTimeout(() => watchForCbsBalanceChanges(channel, sessionToken), 1500)
}

function accountSummarySSE(req, res) {
  const uniqueChannel = new SSEChannel();
  uniqueChannel.subscribe(req, res)

  watchForCbsBalanceChanges(uniqueChannel, req.query.sessionToken)
}

module.exports = {
  getPrimaryAccount,
  getUserId,
  getAccountsList,
  accountSummary,
  accountSummarySSE,
  config,
}
