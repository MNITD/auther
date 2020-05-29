import express from 'express'
import bodyParser from 'body-parser'
import pkceChallenge from 'pkce-challenge'
import {v4 as uuid4} from 'uuid'
import {isNil} from 'ramda'
import axios from 'axios'

import {joinCatch} from './utils/joinCatch'

const port = process.env.PORT || 5000
const {AUTH_SERVER_HOST, CLIENT_ID, CLIENT_REDIRECT_URI} = process.env

const simpleStorage = {}

const clientApp = express()

clientApp.use(bodyParser.urlencoded({extended: false}))
clientApp.use(bodyParser.json())

clientApp.get('/', (req, res) => {
  const {code_verifier, code_challenge} = pkceChallenge()

  const state = uuid4()

  simpleStorage['code_verifier'] = code_verifier
  simpleStorage['state'] = state

  const queryParams = new URLSearchParams({
    state,
    code_challenge,
    response_type: 'code',
    code_challenge_method: 'S256',
    client_id: CLIENT_ID,
    redirect_uri: encodeURIComponent(CLIENT_REDIRECT_URI),
  })

  const homePage = `
    <html>
      <head>
        <title>Auther - Demo Client</title>
      </head>
      <body>       
        <h1>Auther - Demo Client</h1>
        <a href="${AUTH_SERVER_HOST}authorize?${queryParams}"><button type="submit">Connect to Auther</button></a>
      </body>
    </html>
  `
  res.status(200).send(homePage)
})

clientApp.get('/cb', async (req, res) => {
  const requiredFields = ['state', 'code']

  const missingFields = requiredFields.filter(field => isNil(req.query[field]))
  if (missingFields.length)
    return res.status(400).send({error: `Following columns should be defined: [ ${missingFields.join(', ')} ]`})

  if (req.query.state !== simpleStorage.state) return res.status(400).send({error: 'State is incorrect'})

  const [err, data] = await joinCatch(axios.post(`http://auth_server:9000/token`, {
    code: req.query.code,
    grant_type: 'authorization_code',
    client_id: CLIENT_ID,
    redirect_uri: encodeURIComponent(CLIENT_REDIRECT_URI),
    code_verifier: simpleStorage.code_verifier,
  }))

  if (err) return res.status(400).send({error: 'Error during obtaining token', details: err.response?.data || err})

  simpleStorage['tokens'] = data

  res.redirect('/secret')
})

clientApp.get('/secret', (req, res) => {
  res.status(200).send(`Here are your tokens: ${simpleStorage['tokens']}`)
})

clientApp.listen(port, () => {
  console.log(`Listening on port ${port}`)
})

console.log('Hello, Demo Client is also here!')
