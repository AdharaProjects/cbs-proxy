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
    console.error('Error calling the `auth.getAuth` function:', err)
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
    const authCredentials = req.body
    await checkParams(authCredentials, ['sessionToken'])
    const primaryAccountId = await accounts.getPrimaryAccount(authCredentials.sessionToken)
    res.send({
      primaryAccountId
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
    console.error('Error calling the `auth.getAuth` function:', err)
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
    console.error('Error calling the `auth.getAuth` function:', err)
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
    console.error('Error calling the `auth.getAuth` function:', err)
    res.send({
      'error': 'ERROR while processing request. Please contact the system admin: '+err
    })
  }
})

module.exports = router
