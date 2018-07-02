const expect = require('chai').expect
const assert = require('chai').assert
const fetch = require('node-fetch')
const queryString = require('query-string')
const config = require('../config.js')

const fetchJson = async (uri, options) => await (await fetch(uri, options)).json()
const baseUrlProxy = 'http://localhost:' + config.apiServerPort
const baseUrlCBS = config.cbsApiAddress
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
const transfersUri = baseUrlProxy + '/cbs/transfers'
const transfersOption = (sessionToken, accountId, queryParameters) => ({
  ...fetchOptionsTemplate,
  body: JSON.stringify({
    sessionToken,
    accountId,
    queryParameters
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

let startTime
let endTime
// TODO: make these transfers random in value
const makeRandomTransfersToOmnibusAccount = async (numberOfTransfers, sessionToken, intervalStartIndex, intervalEndIndex) => {
  for(let i = 0; i< numberOfTransfers; ++i) {
    if(i === intervalStartIndex) {
      startTime = new Date()
    }
    let result = await fetchJson(makeTransferToOmnibusUri ,makeTransferToOmnibusOption(sessionToken, {"amount":'1.0' + i,"description":"randomTest #"+i,"type":"user.toOrganization","subject":"system"}))
    if(i === intervalEndIndex) {
      endTime = new Date()
    }
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
    expect(user1SessionToken).to.be.a("string")
    expect(user2SessionToken).to.be.a("string")

    await makeRandomTransfersToOmnibusAccount(50, user1SessionToken, 2, 6)
  })

  describe("Getting information about transactions to the Omnibus Account", async () => {
    let omnibusAccountId

    before (async () => {
      omnibusAccountId = (await fetchJson(getOmnibusAccountIdUri, getOmnibusAccountIdOption(adminSessionToken))).omnibusAccountId
      expect(omnibusAccountId).to.be.a("string")
      expect(parseInt(omnibusAccountId)).to.be.a("number")
    })

    it("should return a summary of the account", async () => {
      const result = (await fetchJson(accountSummaryUri, accountSummaryOption(adminSessionToken, omnibusAccountId, {})))
      // TODO:: Add meaningful tests
      assert(true)
    })

    it("should return a summary from within the time range when `queryParameters.datePeriod` are passed", async () => {
      const result = (await fetchJson(accountSummaryUri, accountSummaryOption(
        adminSessionToken,
        omnibusAccountId,
        {
          datePeriod: {
            fromTime: startTime / 1000,
            toTime: endTime / 1000
          }
        }
      )))
      expect(result.status.incoming.count).to.equal(5)
      expect(result.status.outgoing.count).to.equal(0)
    })

    it("should return all the transfers if no `queryParameters` are passed", async () => {
      const result = (await fetchJson(transfersUri, transfersOption(adminSessionToken, omnibusAccountId, {})))
      // TODO:: Add meaningful tests
      assert(true)
    })

    it("should return transactions in time range when `queryParameters.datePeriod` are passed", async () => {
      const result = (await fetchJson(transfersUri, transfersOption(
        adminSessionToken,
        omnibusAccountId,
        {
          datePeriod: {
            fromTime: startTime / 1000,
            toTime: endTime / 1000
          }
        }
      )))
      expect(result.transfers.length).to.equal(5)
    })
    it("should filter debit/credit transactions correctly transactions in time range when `queryParameters.datePeriod` are passed", async () => {
      const debitResult = (await fetchJson(transfersUri, transfersOption(
        adminSessionToken,
        omnibusAccountId,
        {
          datePeriod: {
            fromTime: startTime / 1000,
            toTime: endTime / 1000
          },
          direction: 'debit'
        }
      )))
      expect(debitResult.transfers.length).to.equal(0)
      const creditResult = (await fetchJson(transfersUri, transfersOption(
        adminSessionToken,
        omnibusAccountId,
        {
          datePeriod: {
            fromTime: startTime / 1000,
            toTime: endTime / 1000
          },
          direction: 'credit'
        }
      )))
      expect(creditResult.transfers.length).to.equal(5)
    })
  })
})
