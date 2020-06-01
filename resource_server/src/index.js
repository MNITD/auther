import express from 'express'
import bodyParser from 'body-parser'
import jwksClient from 'jwks-rsa'
import jwt from 'jsonwebtoken'

const port = process.env.PORT || 3000
const {RESOURCE_SERVER_NAME} = process.env

const app = express()

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/secret', async (req, res) => {
  const authHeader = req.get('Authorization') || ''
  const [bearer, token] = authHeader.split(' ')

  if (bearer === 'Bearer' && token) {
    const client = jwksClient({jwksUri: 'http://auth_server:9000/.well-known/jwks.json'})
    const getKey = (header, callback) =>
      client.getSigningKey(header.kid, (err, key) => callback(null, key.publicKey || key.rsaPublicKey))

    jwt.verify(token, getKey, {audience: RESOURCE_SERVER_NAME}, (err, decoded) => {
      if (err) return res.status(401).send({error: 'Unauthorized'})
      if (decoded && decoded.scopes[RESOURCE_SERVER_NAME]['scope1']) {
        return res.status(200).send({secret: 'SOMESECRETSTOREDINRESOURCESERVER'})
      }
      return res.status(403).send({error: 'Permission denied'})
    })
  } else {
    return res.status(401).send({error: 'Unauthorized'})
  }
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})

console.log('Hello from Demo Resource Server')
