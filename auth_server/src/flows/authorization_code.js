import {groupBy, isNil, path, map, pipe} from 'ramda'
import {verifyChallenge} from 'pkce-challenge'
import {Op} from 'sequelize'

import {joinCatch} from 'src/utils/joinCatch'
import Client from 'src/models/client'
import Code from 'src/models/code'
import Token from 'src/models/token'

import {decrypt} from 'src/utils/decrypt'
import {generateTokenPair, REFRESH_EXPIRATION_TIME} from 'src/utils/token'
import Scope from 'src/models/scope'
import ClientToScope from 'src/models/clientToScope'
import ResourceServer from 'src/models/resourceServer'

const CODE_EXPIRATION_TIME = 60 * 1000
const {in: opIn} = Op

export const obtainingGrant = async (req, res) => {
  const requiredFields = [
    'client_id',
    'redirect_uri',
    'code_challenge',
    'code_challenge_method',
  ]

  const missingFields = requiredFields.filter(field => isNil(req.query[field]))
  if (missingFields.length)
    return res.status(400).send({error: `Following columns should be defined: [ ${missingFields.join(', ')} ]`})

  const decodedRedirectUri = decodeURIComponent(req.query.redirect_uri)

  const [foundErr, client] = await joinCatch(Client.findOne({where: {client_id: req.query.client_id}}))

  if (foundErr) return res.status(500).send({error: 'There was a problem finding the information in database'})
  if (!client) return res.status(400).send({error: 'Client not found'})
  if (!client.redirect_url.includes(decodedRedirectUri)) return res.status(400).send({error: 'Redirect url is incorrect'})

  const [createErr, code] = await joinCatch(Code.create({
    client_id: client.id,
    redirect_uri: req.query.redirect_uri,
    code_challenge: req.query.code_challenge,
    code_challenge_method: req.query.code_challenge_method,
    expires_at: Date.now() + CODE_EXPIRATION_TIME,
    user_id: req.user.id,
  }))

  if (createErr) return res.status(500).send({error: 'There was a problem adding the information in database'})

  const queryParams = new URLSearchParams({code: code.id, state: req.query.state})
  const redirectUrl = `${decodedRedirectUri}?${queryParams}`

  return res.redirect(redirectUrl)
}

export const obtainingToken = async (req, res) => {
  const requiredFields = [
    'code',
    'client_id',
    'redirect_uri',
    'code_verifier',
  ]
  const missingFields = requiredFields.filter(field => isNil(req.body[field]))
  if (missingFields.length)
    return res.status(400).send({error: `Following columns should be defined: [ ${missingFields.join(', ')} ]`})

  const [codeErr, code] = await joinCatch(Code.findOne({where: {id: req.body.code}}))

  if (codeErr) return res.status(500).send({error: 'There was a problem finding the information in database'})
  if (!code) return res.status(400).send({error: 'Code is incorrect'})

  if (Date.now() > code.expires_at) return res.status(400).send({error: 'Code is expired'})

  const [clientErr, client] = await joinCatch(Client.findOne({
    where: {client_id: req.body.client_id},
  }))

  const [clientToScopesErr, clientToScopes] = await joinCatch(ClientToScope.findAll({where: {client_id: client.id}}))
  if (clientToScopesErr) return res.status(500).send({error: 'There was a problem finding the information in database'})

  const [scopesErr, scopes] = await joinCatch(Scope.findAll({
      where: {id: {[opIn]: clientToScopes.map(cts => cts.scope_id)}},
      include: ResourceServer,
    },
  ))
  if (scopesErr) return res.status(500).send({error: 'There was a problem finding the information in database'})

  if (clientErr) return res.status(500).send({error: 'There was a problem finding the information in database'})
  if (!client) return res.status(400).send({error: 'Client not found'})

  if (req.body.redirect_uri !== code.redirect_uri) return res.status(400).send({error: 'Redirect url is incorrect'})

  const destroyItem = (code) => new Promise(async resolve => {
    const [updateErr] = await joinCatch(code.destroy())
    if (updateErr) return res.status(500).send({error: 'There was a problem updating the information in database'})
    return resolve()
  })

  if (client.id !== code.client_id)
    return destroyItem(code).then(() => res.status(400).send({error: 'Client is incorrect'}))

  if (client.type === 'confidential' && decrypt(client.client_secret) !== req.body.client_secret)
    return destroyItem(code).then(() => res.status(400).send({error: 'Client is incorrect'}))

  if (!(code.code_challenge_method === 'S256' && verifyChallenge(req.body.code_verifier, code.code_challenge)))
    return destroyItem(code).then(() => res.status(400).send({error: 'Incorrect code verifier'}))

  const [tokenErr, foundToken] = await joinCatch(Token.findOne({where: {code_id: code.id}}))
  if (tokenErr) return res.status(500).send({error: 'There was a problem finding the information in database'})
  if (foundToken) return destroyItem(foundToken).then(() => res.status(400).send({error: 'Code already used'}))

  const [createErr, newToken] = await joinCatch(Token.create({
    client_id: client.id,
    code_id: code.id,
    user_id: code.user_id,
    expires_at: Date.now() + REFRESH_EXPIRATION_TIME,
  }))

  if (createErr) return res.status(500).send({error: 'There was a problem updating the information in database'})

  const preparedScopes = pipe(
    groupBy(path(['resource_server', 'name'])),
    map(map(path(['name']))),
  )(scopes)

  const audience = Object.keys(preparedScopes)

  res.status(200).send(await generateTokenPair(preparedScopes, audience, code.user_id, newToken.id))
}
