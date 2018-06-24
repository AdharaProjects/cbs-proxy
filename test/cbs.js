const expect = require('chai').expect
const assert = require('chai').assert
const fetch = require('node-fetch')

const fetchJson = async (uri, options) => await (await fetch(uri, options)).json()
const baseUrlProxy = 'http://localhost:3000'
const baseUrlCBS = 'http://localhost:4000'
const fetchOptionsTemplate = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
}
const getAuthUri = baseUrlProxy + '/cbs/getAuth'
const getAuthOptions = username => ({
  ...fetchOptionsTemplate,
  body: JSON.stringify({
    username,
    password: 'abcd'
  })
})
const getOmnibusAccountIdUri = baseUrlProxy + '/cbs/getOmnibusAccountId'
const getOmnibusAccountIdOption = sessionToken => ({
  ...fetchOptionsTemplate,
  body: JSON.stringify({
    sessionToken
  })
})
const accountSummaryUri = baseUrlProxy + '/cbs/accountSummary'
const accountSummaryOption = (sessionToken, accountId, queryParameters) => ({
  ...fetchOptionsTemplate,
  body: JSON.stringify({
    sessionToken,
    accountId,
    queryParameters
  })
})
  })
})
const makeTransferToOmnibusUri = baseUrlCBS + '/api/self/payments?fields=id&fields=authorizationStatus'
const makeTransferToOmnibusOption = (sessionToken, transferDataBody) => ({
  ...fetchOptionsTemplate,
  headers: {
    ...fetchOptionsTemplate.headers,
    'Session-Token': sessionToken,
  },
  body: JSON.stringify(transferDataBody)
})

// TODO: make these transfers randam,
const makeRandomTransfersToOmnibusAccount = async (numberOfTransfers, sessionToken) => {
  for(let i = 0; i< numberOfTransfers; ++i) {
    let result = await fetchJson(makeTransferToOmnibusUri ,makeTransferToOmnibusOption(sessionToken, {"amount":'1.0' + i,"description":"randomTest #","type":"user.toOrganization","subject":"system"}))
  }
}

describe("The core banking system proxy", function() {
  this.timeout(30*1000)

  let adminSessionToken
  let user1SessionToken
  let user2SessionToken

  before (async () => {
    adminSessionToken = (await fetchJson(getAuthUri, getAuthOptions('admin'))).sessionToken
    user1SessionToken = (await fetchJson(getAuthUri, getAuthOptions('user1'))).sessionToken
    user2SessionToken = (await fetchJson(getAuthUri, getAuthOptions('user2'))).sessionToken
    expect(adminSessionToken).to.be.a("string")
    console.log(user1SessionToken)
    expect(user1SessionToken).to.be.a("string")
    expect(user2SessionToken).to.be.a("string")

    await makeRandomTransfersToOmnibusAccount(6, user1SessionToken)
  })

  describe("Getting information about transactions to the Omnibus Account", async () => {
    let omnibusAccountId

    before (async () => {
      omnibusAccountId = (await fetchJson(getOmnibusAccountIdUri ,getOmnibusAccountIdOption(adminSessionToken))).omnibusAccountId
      expect(omnibusAccountId).to.be.a("string")
      expect(parseInt(omnibusAccountId)).to.be.a("number")
    })

    it("should return a summary of the account", async () => {
      const result = (await fetchJson(accountSummaryUri, accountSummaryOption(adminSessionToken, omnibusAccountId, {})))
      // TODO:: Add meaningful tests
      assert(true)
    })
  })
})
