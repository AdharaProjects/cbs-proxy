const expect = require('chai').expect
const index = require('../index.js')

const username = 'user1'
const password = '12345678'

describe("index.js", function() {
  this.timeout(10*1000)

  it("Route: api/auth - Returns data about the currently authenticated user", async function() {
    let response = await index.getAuth(username, password)
    expect(response.user).to.not.be.undefined
  })
})


