const fetch = require('node-fetch')
const queryString = require('query-string')

const config = require('../config')

async function transfers(sessionToken, accountId, queryParameters) {
  const stringifiedParameters = queryString.stringify({...queryParameters})

  const uri = config.cbsApiAddress + '/api/self/accounts/'+accountId+'/history?'+stringifiedParameters

  const options = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Session-Token': sessionToken
    }
  }
  try{
    const response = await fetch(uri, options)

    const jsonBody = await response.json()

    return {
      transfers: jsonBody,
      totalCount: response.headers.get('X-Total-Count'),
      pageSize: response.headers.get('X-Page-Size'),
      currentPage: response.headers.get('X-Current-Page'),
      hasNextPage: response.headers.get('X-Has-Next-Page')
    }
  } catch(err){
    return {
      result: false
    }
  }
}

module.exports = {
  transfers,
}
