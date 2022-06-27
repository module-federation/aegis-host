'use strict'

const express = require('express')
const app = express()
const port = 3000

app.use(express.json())
app.use(express.static('exposed'))

app.listen(port, () => console.log(`listening on ${port}`))
