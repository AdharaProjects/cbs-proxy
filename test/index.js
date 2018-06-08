const expect = require('chai').expect
const index = require('../index.js')

const username = 'coenie'
const password = 'n[RI>LVc^OWs'

describe("index.js", function() {
  this.timeout(10*1000)

  it("Route: api/auth - Returns data about the currently authenticated user", async function() {
    const response = await index.getAuth(username, password)
    expect(response.user).to.not.be.undefined
  })

  it("Route: api/transfers - Searches for transfers over multiple accounts", async function() {
    const response = await index.getTransfers(username, password)
    expect(response[0].id).to.be.a('string')
  })

  it("Route: api/transfers/{key} - Returns details about a transfer", async function() {
    const transfers = await index.getTransfers(username, password)
    const key = transfers[0].id
    const transferDetail = await index.getTransferByKey(username, password, key)
    expect(transferDetail.transaction).to.not.be.undefined
  })
})


