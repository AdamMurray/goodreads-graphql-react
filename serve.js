const express = require('express')
const graphqlHTTP = require('express-graphql')
const app = express()
const fetch = require('node-fetch')
const schema = require('./schema')
const DataLoader = require('dataloader')
const util = require('util')
const parseXML = util.promisify(require('xml2js').parseString)
const PORT = 4000
const GOODREADS_API_KEY = 'ix0OvIfnQNzTe5DiMi9Yeg'

const fetchAuthor = id =>
fetch(`https://www.goodreads.com/author/show.xml?id=${id}&key=${GOODREADS_API_KEY}`)
.then(response => response.text())
.then(parseXML)

const fetchBook = id =>
fetch(`https://www.goodreads.com/book/show/${id}.xml?key=${GOODREADS_API_KEY}`)
  .then(response => response.text())
  .then(parseXML)

app.use('/graphql', graphqlHTTP( req => {

  const authorLoader = new DataLoader(keys =>
    Promise.all(keys.map(fetchAuthor)))

  const bookLoader = new DataLoader(keys =>
    Promise.all(keys.map(fetchBook)))

  return {
    schema,
    context: {
      authorLoader,
      bookLoader
    },
    graphiql: true
  }
}))

app.listen(PORT)
console.log(`Listening at http://localhost:${PORT} ...`)