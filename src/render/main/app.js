const express = require('express')
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const urlencodedParser = bodyParser.urlencoded({ extended: false })

const app = express()
app.use(jsonParser)
app.use(urlencodedParser)

const routes = require('./routes/index')

// 跨域设置
app.all('*', (req, res, next) => {
  if (req.path !== '/' && !req.path.includes('.')) {
    res.header('Access-Control-Allow-Credentials', true)
    res.header('Access-Control-Allow-Origin', req.headers['origin'] || '*')
    res.header('Access-Control-Allow-Headers', 'X-Requested-With')
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
    res.header('Content-Type', 'application/json;charset=utf-8')
  }
  next()
})
// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

app.use('/', routes)
app.listen('3600', () => {
  console.log(`server running @ http://localhost:3600`)
})

module.exports = app
