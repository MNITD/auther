import express from 'express'
import bodyParser from 'body-parser'
import {JWK} from 'node-jose'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcrypt'

import User from 'src/models/user'
import Client from 'src/models/client'
import Code from 'src/models/code'

import {joinCatch} from 'src/utils/joinCatch'

import * as AuthorizationCodeFlow from 'src/flows/authorization_code'

const app = express()

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const getForm = (options) => `
  <html>
    <header>
      <title>${options.name}</title>
      <style>
        body{display: flex; justify-content: center; align-items: center;}
        form{display: flex; flex-direction: column; align-items: center;}
        form > * {margin-bottom: 16px;}
      </style>
    </header>
    <body>
      <form action="${options.originalUrl}" method="post">
        <h1>${options.name}</h1>
        <input type="text" name="username" placeholder="Username" autofocus>
        <input type="password" name="password" placeholder="Password">
        <button type="submit">${options.btnName}</button>
        <a href="${options.link}?${options.originalUrl.split('?')[1] || ''}">${options.linkName}</a>
      </form>
    </body>
  </html>
`

const checkClientData = async (req, res, next) => {
  const decodedRedirectUri = decodeURIComponent(req.query.redirect_uri)

  const [foundErr, client] = await joinCatch(Client.findOne({where: {client_id: req.query.client_id}}))

  if (foundErr) return res.status(500).send({error: 'There was a problem finding the information in database'})
  if (!client) return res.status(400).send({error: 'Client not found'})
  if (!client.redirect_url.includes(decodedRedirectUri)) return res.status(400).send({error: 'Redirect url is incorrect'})

  next()
}

app.get('/', (req, res) => {
  res.status(200).send('Auther API')
})

app.get('/authorize', checkClientData, async (req, res) => {
  const options = {
    name: 'Auther Login',
    originalUrl: req.originalUrl,
    btnName: 'Log in',
    link: '/register',
    linkName: 'Register',
  }
  res.status(200).send(getForm(options))
})

app.post('/authorize', async (req, res) => {
  if (req.query.response_type === 'code') {
    const {username, password} = req.body

    const [userErr, user] = await joinCatch(User.findOne({where: {username}}))
    if (userErr) return res.status(500).send({error: 'There was a problem finding the information in database'})
    if (!user) return res.status(404).send({error: 'User not found'})

    if (await bcrypt.compare(password, user.password)) req.user = user
    else res.status(401).send({error: 'Access denied'})

    return AuthorizationCodeFlow.obtainingGrant(req, res)
  }
  return res.status(400).send({error: 'Authorization response type is not supported'})
})

app.get('/register', checkClientData, async (req, res) => {
  const options = {
    name: 'Auther Register',
    originalUrl: req.originalUrl,
    btnName: 'Register',
    link: '/authorize',
    linkName: 'Log in',
  }
  res.status(200).send(getForm(options))
})

app.post('/register', async (req, res) => {
  if (req.query.response_type === 'code') {
    const {username, password} = req.body

    const [userErr, user] = await joinCatch(User.findOne({where: {username}}))
    if (userErr) return res.status(500).send({error: 'There was a problem finding the information in database'})
    if (user) return res.status(409).send({error: 'Username is not available'})

    const [createErr, newUser] = await joinCatch(User.create({username, password: await bcrypt.hash(password, 10)}))
    if (createErr) return res.status(500).send({error: 'There was a problem updating the information in database'})

    req.user = newUser

    return AuthorizationCodeFlow.obtainingGrant(req, res)
  }

  return res.status(400).send({error: 'Authorization response type is not supported'})
})

app.post('/token', (req, res) => {
  if (req.body.grant_type === 'authorization_code') {
    return AuthorizationCodeFlow.obtainingToken(req, res)
  }

  return res.status(400).send({error: 'Grant type is not supported'})
})

app.post('/revoke', (req, res) => {
  res.status(200).send('revoke')
})

app.get('/.well-known/jwks.json', (req, res) => {
  fs.readFile(path.resolve(__dirname, './data/keypair.json'), async (err, data) => {
    try {
      const {publicKey} = JSON.parse(data)
      const jwk = await JWK.asKey(publicKey, 'pem').then(result => result.toJSON())
      jwk.use = 'sig'
      jwk.alg = 'RS256'
      res.status(200).send({keys: [jwk]})
    } catch (err) {
      res.status(500).send({error: 'There was an problem finding jwk', details: err})
    }
  })
})

export default app
