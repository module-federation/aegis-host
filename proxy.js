var proxy = require('express-http-proxy')
var app = require('express')()

app.use('/', proxy(process.argv[2]))

app.listen(process.argv[3])
