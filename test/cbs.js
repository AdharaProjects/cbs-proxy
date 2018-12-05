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
const getOptionsTemplate = {
  method: 'GET',
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

const getUserIdUri = baseUrlProxy + '/cbs/getUserId'
const getUserIdOptions = sessionToken => ({
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

const makeTransferToAdminPrimaryUri = baseUrlProxy + '/cbs/transferToAdminPrimaryAccount'
const makeTransferFromAdminPrimaryUri = baseUrlProxy + '/cbs/transferFromAdminPrimaryAccount'
const adminPrimaryTransferOption = (transferDataBody) => ({
  ...fetchOptionsTemplate,
  headers: {
    ...fetchOptionsTemplate.headers,
  },
  body: JSON.stringify(transferDataBody)
})

const getAccountBalancesUri = (sessionToken, accountType) => {
  return baseUrlProxy+'/cbs/accountBalances?sessionToken='+sessionToken+'&accountType='+accountType
}
const getAccountBalancesOptions = () => ({
  ...getOptionsTemplate
})

let toAdminPrimaryAccountStartTime
let toAdminPrimaryAccountEndTime
// TODO: make these transfers random in value
const makeRandomTransfersToAdminPrimaryAccount = async (numberOfTransfers, sessionToken, intervalStartIndex, intervalEndIndex) => {
  for(let i = 0; i< numberOfTransfers; ++i) {
    if(i === intervalStartIndex) {
      toAdminPrimaryAccountStartTime = new Date()
    }
    let result = await fetchJson(makeTransferToAdminPrimaryUri, adminPrimaryTransferOption({amount:'1.0' + i, message:"randomTest #"+i, sessionToken}))
    if(i === intervalEndIndex) {
      toAdminPrimaryAccountEndTime = new Date()
    }
  }
}
let fromAdminPrimaryAccountStartTime
let fromAdminPrimaryAccountEndTime
// TODO: make these transfers random in value
const makeRandomTransfersFromAdminPrimaryAccount = async (numberOfTransfers, sessionToken, accountId, intervalStartIndex, intervalEndIndex) => {
  for(let i = 0; i< numberOfTransfers; ++i) {
    if(i === intervalStartIndex) {
      fromAdminPrimaryAccountStartTime = new Date()
    }
    let result = await fetchJson(makeTransferFromAdminPrimaryUri, adminPrimaryTransferOption({amount:'1.0' + i, message:"randomTest #"+i, sessionToken, accountId}))
    if(i === intervalEndIndex) {
      fromAdminPrimaryAccountEndTime = new Date()
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

    await makeRandomTransfersToAdminPrimaryAccount(50, user1SessionToken, 2, 6)
    await makeRandomTransfersFromAdminPrimaryAccount(50, adminSessionToken, testConfig.cbsAccountIdUser1, 2, 6)
  })

  describe("Getting information about all accounts of a particular type", async function() {
    it("should return a list of accounts with their balances", async function() {
      const result = await fetchJson(getAccountBalancesUri(adminSessionToken, 'user'), getAccountBalancesOptions())
      expect(result.accountBalances).to.not.be.undefined
      expect(result.accountBalances.length).to.be.at.least(0)
    })
  })

  describe("Getting information about transactions TO the Admin's Primary Account", async () => {
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

    it("should be able to return a user id", async () => {
      const result = (await fetchJson(getUserIdUri, getUserIdOptions(user1SessionToken)))
      expect(Number(result)).to.be.a('number')
    })

    it("should return a summary for Admin from within the time range when `queryParameters.datePeriod` are provided", async () => {
      const result = (await fetchJson(accountSummaryUri, accountSummaryOption(
        adminSessionToken,
        adminPrimaryAccountId,
        {
          datePeriod: {
            fromTime: toAdminPrimaryAccountStartTime / 1000,
            toTime: toAdminPrimaryAccountEndTime / 1000
          }
        }
      )))
      expect(result.status.incoming.count).to.equal(5)
      expect(result.status.outgoing.count).to.equal(0)
    })

    it("should return a summary for User from within the time range when `queryParameters.datePeriod` are provided", async () => {
      const result = (await fetchJson(accountSummaryUri, accountSummaryOption(
        user1SessionToken,
        userAccountId,
        {
          datePeriod: {
            fromTime: toAdminPrimaryAccountStartTime / 1000,
            toTime: toAdminPrimaryAccountEndTime / 1000
          }
        }
      )))
      expect(result.status.incoming.count).to.equal(0)
      expect(result.status.outgoing.count).to.equal(5)
    })

    it("should return all the transfers if no `queryParameters` are provided", async () => {
      const result = (await fetchJson(transfersUri, transfersOption(adminSessionToken, adminPrimaryAccountId, {})))
      // TODO:: Add meaningful tests
      assert(true)
    })

    it("should return admin transactions in time range when `queryParameters.datePeriod` are provided", async () => {
      const adminTransferList = (await fetchJson(transfersUri, transfersOption(
        adminSessionToken,
        adminPrimaryAccountId,
        {
          datePeriod: {
            fromTime: toAdminPrimaryAccountStartTime / 1000,
            toTime: toAdminPrimaryAccountEndTime / 1000
          }
        }
      )))
      expect(adminTransferList.transfers.length).to.equal(5)
    })

    it("should return users transactions in time range when `queryParameters.datePeriod` are provided", async () => {
      const userTransferList = (await fetchJson(transfersUri, transfersOption(
        user1SessionToken,
        userAccountId,
        {
          datePeriod: {
            fromTime: toAdminPrimaryAccountStartTime / 1000,
            toTime: toAdminPrimaryAccountEndTime / 1000
          }
        }
      )))
      expect(userTransferList.transfers.length).to.equal(5)
    })

    it("should filter admin debit/credit transactions correctly transactions in time range when `queryParameters.datePeriod` are provided", async () => {
      const debitResult = (await fetchJson(transfersUri, transfersOption(
        adminSessionToken,
        adminPrimaryAccountId,
        {
          datePeriod: {
            fromTime: toAdminPrimaryAccountStartTime / 1000,
            toTime: toAdminPrimaryAccountEndTime / 1000
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
            fromTime: toAdminPrimaryAccountStartTime / 1000,
            toTime: toAdminPrimaryAccountEndTime / 1000
          },
          direction: 'credit'
        }
      )))
      expect(creditResult.transfers.length).to.equal(5)
    })

    it("should filter users debit/credit transactions correctly transactions in time range when `queryParameters.datePeriod` are provided", async () => {
      const debitResult = (await fetchJson(transfersUri, transfersOption(
        user1SessionToken,
        userAccountId,
        {
          datePeriod: {
            fromTime: toAdminPrimaryAccountStartTime / 1000,
            toTime: toAdminPrimaryAccountEndTime / 1000
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
            fromTime: toAdminPrimaryAccountStartTime / 1000,
            toTime: toAdminPrimaryAccountEndTime / 1000
          },
          direction: 'credit'
        }
      )))
      expect(creditResult.transfers.length).to.equal(0)
    })
  })

  describe("Getting information about transactions FROM the Admin's Primary Account", async () => {
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

    it("should return a summary for admin account from within the time range when `queryParameters.datePeriod` are provided", async () => {
      const result = (await fetchJson(accountSummaryUri, accountSummaryOption(
        adminSessionToken,
        adminPrimaryAccountId,
        {
          datePeriod: {
            fromTime: fromAdminPrimaryAccountStartTime / 1000,
            toTime: fromAdminPrimaryAccountEndTime / 1000
          }
        }
      )))
      expect(result.status.incoming.count).to.equal(0)
      expect(result.status.outgoing.count).to.equal(5)
    })

    it("should return a summary for user account from within the time range when `queryParameters.datePeriod` are provided", async () => {
      const result = (await fetchJson(accountSummaryUri, accountSummaryOption(
        user1SessionToken,
        userAccountId,
        {
          datePeriod: {
            fromTime: fromAdminPrimaryAccountStartTime / 1000,
            toTime: fromAdminPrimaryAccountEndTime / 1000
          }
        }
      )))
      expect(result.status.incoming.count).to.equal(5)
      expect(result.status.outgoing.count).to.equal(0)
    })

    it("should return all the transfers if no `queryParameters` are provided", async () => {
      const result = (await fetchJson(transfersUri, transfersOption(adminSessionToken, adminPrimaryAccountId, {})))
      // TODO:: Add meaningful tests
      assert(true)
    })

    it("should return transactions in time range when `queryParameters.datePeriod` are provided", async () => {
      const result = (await fetchJson(transfersUri, transfersOption(
        adminSessionToken,
        adminPrimaryAccountId,
        {
          datePeriod: {
            fromTime: fromAdminPrimaryAccountStartTime / 1000,
            toTime: fromAdminPrimaryAccountEndTime / 1000
          }
        }
      )))
      expect(result.transfers.length).to.equal(5)
    })

    it("should return users transactions in time range when `queryParameters.datePeriod` are provided", async () => {
      const userTransferList = (await fetchJson(transfersUri, transfersOption(
        user1SessionToken,
        userAccountId,
        {
          datePeriod: {
            fromTime: fromAdminPrimaryAccountStartTime / 1000,
            toTime: fromAdminPrimaryAccountEndTime / 1000
          }
        }
      )))
      expect(userTransferList.transfers.length).to.equal(5)
    })

    it("should filter admin debit/credit transactions correctly transactions in time range when `queryParameters.datePeriod` are provided", async () => {
      const debitResult = (await fetchJson(transfersUri, transfersOption(
        adminSessionToken,
        adminPrimaryAccountId,
        {
          datePeriod: {
            fromTime: fromAdminPrimaryAccountStartTime / 1000,
            toTime: fromAdminPrimaryAccountEndTime / 1000
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
            fromTime: fromAdminPrimaryAccountStartTime / 1000,
            toTime: fromAdminPrimaryAccountEndTime / 1000
          },
          direction: 'credit'
        }
      )))
      expect(creditResult.transfers.length).to.equal(0)
    })

    it("should filter user debit/credit transactions correctly transactions in time range when `queryParameters.datePeriod` are provided", async () => {
      const debitResult = (await fetchJson(transfersUri, transfersOption(
        user1SessionToken,
        userAccountId,
        {
          datePeriod: {
            fromTime: fromAdminPrimaryAccountStartTime / 1000,
            toTime: fromAdminPrimaryAccountEndTime / 1000
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
            fromTime: fromAdminPrimaryAccountStartTime / 1000,
            toTime: fromAdminPrimaryAccountEndTime / 1000
          },
          direction: 'credit'
        }
      )))
      expect(creditResult.transfers.length).to.equal(5)
    })
  })
})
