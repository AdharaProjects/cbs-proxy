const fetch = require('node-fetch')
const queryString = require('query-string')

const config = require('../config')

async function transfer(sessionToken, queryParameters) {
  const uri = config.cbsApiAddress + '/api/self/payments?fields=id&fields=authorizationStatus'

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Session-Token': sessionToken
    },
    body: JSON.stringify(queryParameters)
  }
  try{
    const response = await fetch(uri, options)

    const jsonBody = await response.json()
    console.log('transfer', queryParameters, jsonBody)
    return {
      transferId: jsonBody.id
    }
  } catch(err){
    return {
      result: false
    }
  }
}

module.exports = {
  transfer,
}
