const app = require('./app.js')
const config = require('./config.js')

const server = app.listen(config.apiServerPort, function(){
  console.log('Express server listening on port:', config.apiServerPort)
})
