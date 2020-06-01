import {isNil, pick} from 'ramda'

import {joinCatch} from 'src/utils/joinCatch'
import Client from 'src/models/client'
import {decrypt} from 'src/utils/decrypt'
import {generateTokenPair, REFRESH_EXPIRATION_TIME, verifyToken} from 'src/utils/token'
import Token from 'src/models/token'

export const obtainingToken = async (req, res) => {
  const requiredFields = [
    'refresh_token',
    'client_id',
  ]
  const missingFields = requiredFields.filter(field => isNil(req.body[field]))
  if (missingFields.length)
    return res.status(400).send({error: `Following columns should be defined: [ ${missingFields.join(', ')} ]`})

  const [clientErr, client] = await joinCatch(Client.findOne({where: {client_id: req.body.client_id}}))
  if (clientErr) return res.status(500).send({error: 'There was a problem finding the information in database'})
  if (!client) return res.status(400).send({error: 'Client not found'})

  if (client.type === 'confidential' && decrypt(client.client_secret) !== req.body.client_secret)
    return res.status(401).send({error: 'Client is incorrect'})

  const [err, decoded] = await joinCatch(verifyToken(req.body.refresh_token, {ignoreExpiration: true}))
  if (err) return res.status(401).send({error: 'There was an problem verifying refresh token'})

  const [tokenErr, token] = await joinCatch(Token.findOne({where: {id: decoded.jwtid}}))
  if (tokenErr) return res.status(500).send({error: 'There was a problem finding the information in database'})
  if (!token) return res.status(404).send({error: 'Token not found'})

  if (token.expires_at < Date.now()) {
    const [destroyErr] = await joinCatch(token.destroy())
    if (destroyErr) return res.status(500).send({error: 'There was a problem updating the information in database'})

    if (err) return res.status(401).send({error: 'Token is expired'})
  }

  const [createErr, newToken] = await joinCatch(Token.create({
    ...pick(['client_id', 'code_id', 'user_id'], token),
    expires_at: Date.now() + REFRESH_EXPIRATION_TIME,
  }))
  if (createErr) return res.status(500).send({error: 'There was a problem updating the information in database'})

  const [destroyErr] = await joinCatch(token.destroy())
  if (destroyErr) return res.status(500).send({error: 'There was a problem updating the information in database'})

  const tokenPair = await generateTokenPair(
    decoded.scopes,
    decoded.audience,
    decoded.subject,
    newToken.id
  )

  return res.status(200).send(tokenPair)
}
