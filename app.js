const express = require('express')
const swaggerJSDoc = require('swagger-jsdoc')
const cbs = require('./cbs')
const config = require('./config')

const app = express()

const swaggerDefinition = {
  info: {
    title: 'CBS-proxy',
    version: '0.0.1',
    description: 'CBS-proxy API documentation'
  },
  host: 'localhost:' + config.apiServerPort,
  basePath: '/'
}

const options = {
  swaggerDefinition,
  apis: ['./app.js', './cbs/index.js']
}

const swaggerSpec = swaggerJSDoc(options)

app.use('/cbs', cbs)

app.use('/api-docs', express.static('api-docs'))

/**
 * @swagger
 * /isAPIRunning:
 *   get:
 *     tags:
 *       - isAPIRunning
 *     description: Returns true if the API is running
 *     produces:
 *       - application/json
 *     responses:
 *       200: {
 *         description: Returns true if API is running
 *       }
 */
app.get('/isAPIRunning', function(req, res){
  res.send({
    result: true
  })
})

/**
 * @swagger
 * /swagger.json:
 *   get:
 *     tags:
 *       - swagger.json
 *     description: Returns JSON formatted API documents
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns JSON formatted API documents
 */
app.get('/swagger.json', function(req, res){
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
})

module.exports = app
