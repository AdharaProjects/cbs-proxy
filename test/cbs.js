const expect = require('chai').expect
const assert = require('chai').assert
const fetch = require('node-fetch')

const fetchJson = async (uri, options) => await (await fetch(uri, options)).json()
const baseUrl = 'http://localhost:3000'
const fetchOptionsTemplate = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
}
const getAuthUri = baseUrl + '/cbs/getAuth'
const getAuthOptions = {
  ...fetchOptionsTemplate,
  body: JSON.stringify({
    username: 'admin',
    password: 'abcd'
  })
}
const getOmnibusAccountIdUri = baseUrl + '/cbs/getOmnibusAccountId'
const getOmnibusAccountdOption = sessionToken => ({
  ...fetchOptionsTemplate,
  body: JSON.stringify({
    sessionToken
  })
})

describe("The core banking system proxy", function() {
  this.timeout(10*1000)

  let sessionToken

  before (async () => {
    sessionToken = (await fetchJson(getAuthUri, getAuthOptions)).sessionToken
    expect(sessionToken).to.be.a("string")
  })

  describe("Getting information about transactions to the Omnibus Account", async () => {
    let omnibusAccountId

    before (async () => {
      omnibusAccountId = (await fetchJson(getOmnibusAccountIdUri ,getOmnibusAccountdOption(sessionToken))).omnibusAccountId
      expect(omnibusAccountId).to.be.a("string")
      expect(parseInt(omnibusAccountId)).to.be.a("number")
    })

    it("Placeholder for when I add real tests", async () => {
      assert(true)
    })
  })
})
