const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')

const auth = require('./auth.js')
const checkParams = require('../util.js').checkParams

router.use(bodyParser.urlencoded({extended: true}))
router.use(bodyParser.json())

/**
 * @swagger
 * /cbs/getAuth:
 *   post:
 *     tags:
 *       - getAuth
 *     description: Returns the highest block number on the node
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: username
 *         description: username you wish to login with
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         description: password corresponding to your username
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200: {
 *         description: Returns the authorization token
 *       }
 */
router.post('/getAuth', async function(req, res){
  try{
    const authToken = await auth.getAuth('admin', 'abcd')
    res.send({
      authToken
    })
  } catch (err) {
    console.error('Error calling the `auth.getAuth` function:', err)
    res.send({
      'error': 'ERROR while processing request. Please contact the system admin: '+err
    })
  }
})

module.exports = router
