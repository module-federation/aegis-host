var proxy = require('express-http-proxy')
var app = require('express')()

app.use('/', proxy('http://localhost:8070'))

app.listen()
