require('dotenv').config({ path: '.env.local' })
const express = require('express')
const app = express()
const port = process.env.NODE_PORT

app.get('/', (req, res) => {
  res.send('GO!')
})

app.listen(port, () => {
  console.log(`Currently listening on port ${port}!`)
})
