const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')

const auth = require('./auth.js')
const accounts = require('./accounts.js')
const transfers = require('./transfers.js')
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
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *               example: admin
 *             password:
 *               type: string
 *               example: abcd
 *     responses:
 *       200: {
 *         description: Returns the authorization token
 *       }
 */
router.post('/getAuth', async (req, res) =>{
  try{
    const authCredentials = req.body
    await checkParams(authCredentials, ['username', 'password'])
    const sessionToken = await auth.getAuth(authCredentials.username, authCredentials.password)
    res.send({
      sessionToken
    })
  } catch (err) {
    console.error('Error calling the `auth.getAuth` function:', err)
    res.send({
      'error': 'ERROR while processing request. Please contact the system admin: '+err
    })
  }
})

/**
 * @swagger
 * /cbs/getOmnibusAccountId:
 *   post:
 *     tags:
 *       - getOmnibusAccountId
 *     description: Returns the highest block number on the node
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             sessionToken:
 *               type: string
 *               example: xxx123xxx456xxx
 *     responses:
 *       200: {
 *         description: Returns the id of the omnibus account
 *       }
 */
router.post('/getOmnibusAccountId', async function(req, res){
  try{
    const authCredentials = req.body
    await checkParams(authCredentials, ['sessionToken'])
    const omnibusAccountId = await accounts.getOmnibusAccount(authCredentials.sessionToken)
    res.send({
      omnibusAccountId
    })
  } catch (err) {
    console.error('Error calling the `auth.getAuth` function:', err)
    res.send({
      'error': 'ERROR while processing request. Please contact the system admin: '+err
    })
  }
})

/**
 * @swagger
 * /cbs/accountSummary:
 *   post:
 *     tags:
 *       - accountSummary
 *     description: Returns a sumary of accounts activity and balance
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             sessionToken:
 *               type: string
 *               example: xxx123xxx456xxx
 *             accountId:
 *               type: string
 *               example: 123456789
 *             queryParameters:
 *               type: object
 *               properties:
 *                 datePeriod:
 *                   type: array
 *                   example: ['2018-06-25T10:17:37.085+02:00', '2019-06-25T10:17:37.085+02:00']
 *                 direction:
 *                   type: enum
 *                   example: credit/debit
 *     responses:
 *       200: {
 *         description: Returns a summary of the account
 *       }
 */
router.post('/accountSummary', async (req, res) =>{
  try{
    const summary = await accounts.accountSummary(req.body.sessionToken, req.body.accountId, req.body.queryParameters)
    res.send(summary)
  } catch (err) {
    console.error('Error calling the `auth.getAuth` function:', err)
    res.send({
      'error': 'ERROR while processing request. Please contact the system admin: '+err
    })
  }
})

/**
 * @swagger
 * /cbs/transfers:
 *   post:
 *     tags:
 *       - transfers
 *     description: Returns a list of recent transfers
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             sessionToken:
 *               type: string
 *               example: xxx123xxx456xxx
 *             accountId:
 *               type: string
 *               example: 123456789
 *             queryParameters:
 *               type: object
 *               properties:
 *                 datePeriod:
 *                   type: array
 *                   example: ['2018-06-25T10:17:37.085+02:00', '2019-06-25T10:17:37.085+02:00']
 *                 direction:
 *                   type: enum
 *                   example: credit
 *     responses:
 *       200: {
 *         description: Returns an array of previous transfers
 *       }
 */
router.post('/transfers', async (req, res) =>{
  try{
    const transfersResult = await transfers.transfers(req.body.sessionToken, req.body.accountId, req.body.queryParameters)
    res.send(transfersResult)
  } catch (err) {
    console.error('Error calling the `auth.getAuth` function:', err)
    res.send({
      'error': 'ERROR while processing request. Please contact the system admin: '+err
    })
  }
})

module.exports = router
