const app = require('./app.js')
const port = process.env.API_PORT || 3000

const server = app.listen(port, function(){
  console.log('Express server listening on port:', port)
})
