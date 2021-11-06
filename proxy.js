var proxy = require('express-http-proxy')
var app = require('express')()

app.use('/', proxy(process.argv[2]))
app.listen(process.argv[3], () =>
  console.log(
    'proxy redirect to',
    process.argv[2],
    'from port',
    process.argv[3]
  )
)
