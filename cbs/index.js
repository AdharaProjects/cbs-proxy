const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')

const helpers = require('./helpers.js')
const auth = require('./auth.js')
const accounts = require('./accounts.js')
const transfers = require('./transfers.js')
const transfer = require('./transfer.js')
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
    console.error('Error calling the /getAuth route:', err)
    res.send({
      'error': 'ERROR while processing request. Please contact the system admin: '+err
    })
  }
})

/**
 * @swagger
 * /cbs/getPrimaryAccountId:
 *   post:
 *     tags:
 *       - getPrimaryAccountId
 *     description: Returns taccount id of the current user's primary account
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
 *         description: Returns the id of the user's primary account
 *       }
 */
router.post('/getPrimaryAccountId', async function(req, res){
  try{
    await checkParams(req.body, ['sessionToken'])
    const primaryAccountId = await accounts.getPrimaryAccount(req.body.sessionToken)
    res.send({
      primaryAccountId
    })
  } catch (err) {
    console.error('Error calling the /getPrimaryAccountId route:', err)
    res.send({
      'error': 'ERROR while processing request. Please contact the system admin: '+err
    })
  }
})

/**
 * @swagger
 * /cbs/getUserId:
 *   post:
 *     tags:
 *       - getUserId
 *     description: Returns the userId of the current user
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
 *         description: Returns the id of the user
 *       }
 */
router.post('/getUserId', async function(req, res){
  try{
    await checkParams(req.body, ['sessionToken'])
    const userId = await accounts.getUserId(req.body.sessionToken)
    res.send({
      userId
    })
  } catch (err) {
    console.error('Error calling the /getUserId route:', err)
    res.send({
      'error': 'ERROR while processing request. Please contact the system admin: '+err
    })
  }
})

/**
 * @swagger
 * /cbs/getAccountsList:
 *   post:
 *     tags:
 *       - accountSummary
 *     description: Returns a list of the user's account and a summary of each of them
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
 *         description: Returns a list of the user's account and a summary of each of them
 *       }
 */
router.post('/getAccountsList', async (req, res) => {
  try{
    const account = await accounts.getAccountsList(req.body.sessionToken)
    res.send(account)
  } catch (err) {
    console.error('Error calling the /getAccountsList route:', err)
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
 *                   properties:
 *                     fromTime:
 *                       type: integer
 *                       example: '2018-06-25T10:17:37.085+02:00'
 *                     toTime:
 *                       type: integer
 *                       example: '2019-06-25T10:17:37.085+02:00'
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
    const queryParameters = helpers.parseQueryParams(req.body.queryParameters)
    const summary = await accounts.accountSummary(req.body.sessionToken, req.body.accountId, queryParameters)
    res.send(summary)
  } catch (err) {
    console.error('Error calling the /accountSummary route:', err)
    res.send({
      'error': 'ERROR while processing request. Please contact the system admin: '+err
    })
  }
})

/**
 * @swagger
 * /web3sse/subscribeToAccountDetails:
 *   get:
 *     tags:
 *       - accountSummary
 *     description: Subscribes to account updates
 *     produces:
 *       - text/event-stream
 *       - application/json
 *     parameters:
 *       - sessionToken: string
 *         description: the logged in user's session token
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200: {
 *         description: Subscribes to account updates,
 *         x-produces: text/event-stream,
 *         headers: {
 *           Content-Type: {
 *             type: string,
 *             enum: text/event-stream
 *           }
 *         }
 *       }
 */

router.get('/subscribeToAccountDetails', function(req, res){
  try {
    accounts.accountSummarySSE(req, res)
  } catch(err){
    console.log('ERROR with subscribeToAccountDetails', err)
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
 *                   type: object
 *                   properties:
 *                     fromTime:
 *                       type: integer
 *                       example: '2018-06-25T10:17:37.085+02:00'
 *                     toTime:
 *                       type: integer
 *                       example: '2019-06-25T10:17:37.085+02:00'
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
    const queryParameters = helpers.parseQueryParams(req.body.queryParameters)
    const transfersResult = await transfers.transfers(req.body.sessionToken, req.body.accountId, queryParameters)
    res.send(transfersResult)
  } catch (err) {
    console.error('Error calling the /transfers route:', err)
    res.send({
      'error': 'ERROR while processing request. Please contact the system admin: '+err
    })
  }
})

/**
 * @swagger
 * /cbs/transferFromAdminPrimaryAccount:
 *   post:
 *     tags:
 *       - transfers
 *     description: Sends a transaction to the admin's primary account (this account can be considered the Omnibus account depending on use case)
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             amount:
 *               type: float
 *               example: 102.56
 *             message:
 *               type: string
 *               example: test message
 *             sessionToken:
 *               type: string
 *               example: abcde
 *             accountId:
 *               type: string
 *               example: 123456789
 *     responses:
 *       200: {
 *         transactionId: the id of the resulting transaction
 *       }
 */
router.post('/transferFromAdminPrimaryAccount', async (req, res) =>{
  try{
    const {amount, message, sessionToken, accountId} = req.body

    const transferDetails = {amount: amount, description: message, type: 'organization.toUser', subject: accountId}
    const transfersResult = await transfer.transfer(sessionToken, transferDetails)
    res.send(transfersResult)
  } catch (err) {
    console.error('Error calling the /transferFromAdminPrimaryAccount route:', err)
    res.send({
      'error': 'ERROR while processing request. Please contact the system admin: '+err
    })
  }
})

/**
* @swagger
* /cbs/transferToAdminPrimaryAccount:
*   post:
*     tags:
*       - transfers
*     description: Sends a transaction to the admin's primary account (this account can be considered the Omnibus account depending on use case)
*     produces:
*       - application/json
*     parameters:
*       - name: body
*         in: body
*         required: true
*         schema:
*           type: object
*           properties:
*             amount:
*               type: float
*               example: 102.56
*             message:
*               type: string
*               example: test message
*             sessionToken:
*               type: string
*               example: abcde
*     responses:
*       200: {
*         transactionId: the id of the resulting transaction
*       }
*/
router.post('/transferToAdminPrimaryAccount', async (req, res) => {
  try{
    const {amount, message, sessionToken} = req.body

    const transferDetails = {amount: amount, description: message, type: 'user.toOrganization', subject: 'system'}
    const transfersResult = await transfer.transfer(sessionToken, transferDetails)
    res.send(transfersResult)
  } catch (err) {
    console.error('Error calling the /transferFromAdminPrimaryAccount route:', err)
    res.send({
      'error': 'ERROR while processing request. Please contact the system admin: '+err
    })
  }
})

module.exports = router
