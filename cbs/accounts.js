const fetch = require('node-fetch')
const queryString = require('query-string')
const SSEChannel = require('sse-pubsub')
const EventSource = require('eventsource')

const config = require('../config')

const userChannels = {}

async function getPrimaryAccount(sessionToken){
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

async function getUserId(sessionToken){
  const options = {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Session-Token': sessionToken
    }
  }
  try{
    const userUri = config.cbsApiAddress + '/api/users/self'
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

function watchForCbsBalanceChanges(channel, sessionToken, accountId) {
  // NOTE:: This generates a random string (in a very clever way, hint base 36 ;) ).
  //        This parameter is required by the npm install eventsourcecyclos client, but it can be anything.
  const clientId = Math.random().toString(36).substring(7)
  const uri = config.cbsApiAddress + '/api/push/subscribe?clientId='+clientId+'&kinds=accountStatus&accountIds='+accountId
  const eventSourceConfig = {headers: {'Session-Token': sessionToken}};
  const eventSource = new EventSource(uri, eventSourceConfig)

  eventSource.addEventListener('accountStatus', function (event) {
    channel.publish(event.data, 'accountDetails')
  })
}

function accountSummarySSE(req, res) {
  const { sessionToken, accountId } = req.query
  if (!userChannels[sessionToken] || !userChannels[sessionToken].channel) {
    userChannels[sessionToken] = {
      channel: new SSEChannel(),
      // TODO:: Add a ttl for channels so that if they aren't used for some period of time they are cleaned out
    }

    watchForCbsBalanceChanges(userChannels[sessionToken].channel, sessionToken, accountId)
  }

  userChannels[sessionToken].channel.subscribe(req, res)
}

async function getAccountBalances(sessionToken, accountType) {
  const uri = config.cbsApiAddress + '/api/accounts/' + accountType + '/user-balances'
  const options = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Session-Token': sessionToken
    }
  }
  try{
    return await (await fetch(uri, options)).json()
  } catch(err){
    return {
      result: false,
      err
    }
  }
}

module.exports = {
  getPrimaryAccount,
  getUserId,
  getAccountsList,
  accountSummary,
  accountSummarySSE,
  getAccountBalances,
  config,
}
