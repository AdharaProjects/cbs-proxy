const expect = require('chai').expect
const assert = require('chai').assert
const fetch = require('node-fetch')
const queryString = require('query-string')
const config = require('../config')

const testConfig = require('./config')

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
const getAuthOptions = (username, password) => ({
  ...fetchOptionsTemplate,
  body: JSON.stringify({
    username,
    password
  })
})
const getPrimaryAccountIdUri = baseUrlProxy + '/cbs/getPrimaryAccountId'
const getPrimaryAccountIdOption = sessionToken => ({
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

const makeTransferToOmnibusUri = baseUrlProxy + '/cbs/transferToOmnibus'
const makeTransferFromOmnibusUri = baseUrlProxy + '/cbs/transferFromOmnibus'
const omnibusTransferOption = (transferDataBody) => ({
  ...fetchOptionsTemplate,
  headers: {
    ...fetchOptionsTemplate.headers,
  },
  body: JSON.stringify(transferDataBody)
})

let toOmnibusAccountStartTime
let toOmnibusAccountEndTime
// TODO: make these transfers random in value
const makeRandomTransfersToOmnibusAccount = async (numberOfTransfers, sessionToken, intervalStartIndex, intervalEndIndex) => {
  for(let i = 0; i< numberOfTransfers; ++i) {
    if(i === intervalStartIndex) {
      toOmnibusAccountStartTime = new Date()
    }
    let result = await fetchJson(makeTransferToOmnibusUri, omnibusTransferOption({amount:'1.0' + i, message:"randomTest #"+i, sessionToken}))
    if(i === intervalEndIndex) {
      toOmnibusAccountEndTime = new Date()
    }
  }
}
let fromOmnibusAccountStartTime
let fromOmnibusAccountEndTime
// TODO: make these transfers random in value
const makeRandomTransfersFromOmnibusAccount = async (numberOfTransfers, sessionToken, accountId, intervalStartIndex, intervalEndIndex) => {
  for(let i = 0; i< numberOfTransfers; ++i) {
    if(i === intervalStartIndex) {
      fromOmnibusAccountStartTime = new Date()
    }
    let result = await fetchJson(makeTransferFromOmnibusUri, omnibusTransferOption({amount:'1.0' + i, message:"randomTest #"+i, sessionToken, accountId}))
    if(i === intervalEndIndex) {
      fromOmnibusAccountEndTime = new Date()
    }
  }
}

describe("The core banking system proxy", function() {
  this.timeout(30*1000)

  let adminSessionToken
  let user1SessionToken

  before (async () => {
    adminSessionToken = (await fetchJson(getAuthUri, getAuthOptions(testConfig.cbsUnameAdmin, testConfig.cbsPasswordAdmin))).sessionToken
    user1SessionToken = (await fetchJson(getAuthUri, getAuthOptions(testConfig.cbsUnameUser1, testConfig.cbsPasswordUser1))).sessionToken
    expect(adminSessionToken).to.be.a("string")
    expect(user1SessionToken).to.be.a("string")

    await makeRandomTransfersToOmnibusAccount(50, user1SessionToken, 2, 6)
    await makeRandomTransfersFromOmnibusAccount(50, adminSessionToken, testConfig.cbsAccountIdUser1, 2, 6)
  })

  it("own test", async () => {
      assert(true)
  })

  describe("Getting information about transactions TO the Omnibus Account", async () => {
    let adminPrimaryAccountId
    let userAccountId

    before (async () => {
      adminPrimaryAccountId = (await fetchJson(getPrimaryAccountIdUri, getPrimaryAccountIdOption(adminSessionToken))).primaryAccountId
      expect(adminPrimaryAccountId).to.be.a("string")
      expect(parseInt(adminPrimaryAccountId)).to.be.a("number")

      userAccountId = (await fetchJson(getPrimaryAccountIdUri, getPrimaryAccountIdOption(user1SessionToken))).primaryAccountId
      expect(userAccountId).to.be.a("string")
      expect(parseInt(userAccountId)).to.be.a("number")
    })

    it("should return a summary of the account", async () => {
      const result = (await fetchJson(accountSummaryUri, accountSummaryOption(adminSessionToken, adminPrimaryAccountId, {})))
      // TODO:: Add meaningful tests
      assert(true)
    })


    it("should return a summary for Admin from within the time range when `queryParameters.datePeriod` are passed", async () => {
      const result = (await fetchJson(accountSummaryUri, accountSummaryOption(
        adminSessionToken,
        adminPrimaryAccountId,
        {
          datePeriod: {
            fromTime: toOmnibusAccountStartTime / 1000,
            toTime: toOmnibusAccountEndTime / 1000
          }
        }
      )))
      expect(result.status.incoming.count).to.equal(5)
      expect(result.status.outgoing.count).to.equal(0)
    })
    it("should return a summary for User from within the time range when `queryParameters.datePeriod` are passed", async () => {
      const result = (await fetchJson(accountSummaryUri, accountSummaryOption(
        user1SessionToken,
        userAccountId,
        {
          datePeriod: {
            fromTime: toOmnibusAccountStartTime / 1000,
            toTime: toOmnibusAccountEndTime / 1000
          }
        }
      )))
      expect(result.status.incoming.count).to.equal(0)
      expect(result.status.outgoing.count).to.equal(5)
    })

    it("should return all the transfers if no `queryParameters` are passed", async () => {
      const result = (await fetchJson(transfersUri, transfersOption(adminSessionToken, adminPrimaryAccountId, {})))
      // TODO:: Add meaningful tests
      assert(true)
    })

    it("should return admin transactions in time range when `queryParameters.datePeriod` are passed", async () => {
      const adminTransferList = (await fetchJson(transfersUri, transfersOption(
        adminSessionToken,
        adminPrimaryAccountId,
        {
          datePeriod: {
            fromTime: toOmnibusAccountStartTime / 1000,
            toTime: toOmnibusAccountEndTime / 1000
          }
        }
      )))
      expect(adminTransferList.transfers.length).to.equal(5)
    })

    it("should return users transactions in time range when `queryParameters.datePeriod` are passed", async () => {
      const userTransferList = (await fetchJson(transfersUri, transfersOption(
        user1SessionToken,
        userAccountId,
        {
          datePeriod: {
            fromTime: toOmnibusAccountStartTime / 1000,
            toTime: toOmnibusAccountEndTime / 1000
          }
        }
      )))
      expect(userTransferList.transfers.length).to.equal(5)
    })

    it("should filter admin debit/credit transactions correctly transactions in time range when `queryParameters.datePeriod` are passed", async () => {
      const debitResult = (await fetchJson(transfersUri, transfersOption(
        adminSessionToken,
        adminPrimaryAccountId,
        {
          datePeriod: {
            fromTime: toOmnibusAccountStartTime / 1000,
            toTime: toOmnibusAccountEndTime / 1000
          },
          direction: 'debit'
        }
      )))
      expect(debitResult.transfers.length).to.equal(0)
      const creditResult = (await fetchJson(transfersUri, transfersOption(
        adminSessionToken,
        adminPrimaryAccountId,
        {
          datePeriod: {
            fromTime: toOmnibusAccountStartTime / 1000,
            toTime: toOmnibusAccountEndTime / 1000
          },
          direction: 'credit'
        }
      )))
      expect(creditResult.transfers.length).to.equal(5)
    })
    it("should filter users debit/credit transactions correctly transactions in time range when `queryParameters.datePeriod` are passed", async () => {
      const debitResult = (await fetchJson(transfersUri, transfersOption(
        user1SessionToken,
        userAccountId,
        {
          datePeriod: {
            fromTime: toOmnibusAccountStartTime / 1000,
            toTime: toOmnibusAccountEndTime / 1000
          },
          direction: 'debit'
        }
      )))
      expect(debitResult.transfers.length).to.equal(5)
      const creditResult = (await fetchJson(transfersUri, transfersOption(
        user1SessionToken,
        userAccountId,
        {
          datePeriod: {
            fromTime: toOmnibusAccountStartTime / 1000,
            toTime: toOmnibusAccountEndTime / 1000
          },
          direction: 'credit'
        }
      )))
      expect(creditResult.transfers.length).to.equal(0)
    })
  })
  describe("Getting information about transactions FROM the Omnibus Account", async () => {
    let adminPrimaryAccountId
    let userAccountId

    before (async () => {
      adminPrimaryAccountId = (await fetchJson(getPrimaryAccountIdUri, getPrimaryAccountIdOption(adminSessionToken))).primaryAccountId
      expect(adminPrimaryAccountId).to.be.a("string")
      expect(parseInt(adminPrimaryAccountId)).to.be.a("number")

      userAccountId = (await fetchJson(getPrimaryAccountIdUri, getPrimaryAccountIdOption(user1SessionToken))).primaryAccountId
      expect(userAccountId).to.be.a("string")
      expect(parseInt(userAccountId)).to.be.a("number")
    })

    it("should return a summary for admin account from within the time range when `queryParameters.datePeriod` are passed", async () => {
      const result = (await fetchJson(accountSummaryUri, accountSummaryOption(
        adminSessionToken,
        adminPrimaryAccountId,
        {
          datePeriod: {
            fromTime: fromOmnibusAccountStartTime / 1000,
            toTime: fromOmnibusAccountEndTime / 1000
          }
        }
      )))
      expect(result.status.incoming.count).to.equal(0)
      expect(result.status.outgoing.count).to.equal(5)
    })
    it("should return a summary for user account from within the time range when `queryParameters.datePeriod` are passed", async () => {
      const result = (await fetchJson(accountSummaryUri, accountSummaryOption(
        user1SessionToken,
        userAccountId,
        {
          datePeriod: {
            fromTime: fromOmnibusAccountStartTime / 1000,
            toTime: fromOmnibusAccountEndTime / 1000
          }
        }
      )))
      expect(result.status.incoming.count).to.equal(5)
      expect(result.status.outgoing.count).to.equal(0)
    })

    it("should return all the transfers if no `queryParameters` are passed", async () => {
      const result = (await fetchJson(transfersUri, transfersOption(adminSessionToken, adminPrimaryAccountId, {})))
      // TODO:: Add meaningful tests
      assert(true)
    })

    it("should return transactions in time range when `queryParameters.datePeriod` are passed", async () => {
      const result = (await fetchJson(transfersUri, transfersOption(
        adminSessionToken,
        adminPrimaryAccountId,
        {
          datePeriod: {
            fromTime: fromOmnibusAccountStartTime / 1000,
            toTime: fromOmnibusAccountEndTime / 1000
          }
        }
      )))
      expect(result.transfers.length).to.equal(5)
    })
    it("should return users transactions in time range when `queryParameters.datePeriod` are passed", async () => {
      const userTransferList = (await fetchJson(transfersUri, transfersOption(
        user1SessionToken,
        userAccountId,
        {
          datePeriod: {
            fromTime: fromOmnibusAccountStartTime / 1000,
            toTime: fromOmnibusAccountEndTime / 1000
          }
        }
      )))
      expect(userTransferList.transfers.length).to.equal(5)
    })
    it("should filter admin debit/credit transactions correctly transactions in time range when `queryParameters.datePeriod` are passed", async () => {
      const debitResult = (await fetchJson(transfersUri, transfersOption(
        adminSessionToken,
        adminPrimaryAccountId,
        {
          datePeriod: {
            fromTime: fromOmnibusAccountStartTime / 1000,
            toTime: fromOmnibusAccountEndTime / 1000
          },
          direction: 'debit'
        }
      )))
      expect(debitResult.transfers.length).to.equal(5)
      const creditResult = (await fetchJson(transfersUri, transfersOption(
        adminSessionToken,
        adminPrimaryAccountId,
        {
          datePeriod: {
            fromTime: fromOmnibusAccountStartTime / 1000,
            toTime: fromOmnibusAccountEndTime / 1000
          },
          direction: 'credit'
        }
      )))
      expect(creditResult.transfers.length).to.equal(0)
    })
    it("should filter user debit/credit transactions correctly transactions in time range when `queryParameters.datePeriod` are passed", async () => {
      const debitResult = (await fetchJson(transfersUri, transfersOption(
        user1SessionToken,
        userAccountId,
        {
          datePeriod: {
            fromTime: fromOmnibusAccountStartTime / 1000,
            toTime: fromOmnibusAccountEndTime / 1000
          },
          direction: 'debit'
        }
      )))
      expect(debitResult.transfers.length).to.equal(0)
      const creditResult = (await fetchJson(transfersUri, transfersOption(
        user1SessionToken,
        userAccountId,
        {
          datePeriod: {
            fromTime: fromOmnibusAccountStartTime / 1000,
            toTime: fromOmnibusAccountEndTime / 1000
          },
          direction: 'credit'
        }
      )))
      expect(creditResult.transfers.length).to.equal(5)
    })
  })
})
