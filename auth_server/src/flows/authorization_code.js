import {isNil} from 'ramda'
import {verifyChallenge} from 'pkce-challenge'

import {joinCatch} from 'src/utils/joinCatch'
import Client from 'src/models/client'
import Code from 'src/models/code'
import Token from 'src/models/token'

import {decrypt} from 'src/utils/decrypt'

const CODE_EXPIRATION_TIME = 60 * 1000

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

  const missingFields = requiredFields.filter(field => isNil(req.query[field]))
  if (missingFields.length)
    return res.status(400).send({error: `Following columns should be defined: [ ${missingFields.join(', ')} ]`})

  const [codeErr, foundCode] = await joinCatch(Code.findOne({where: {id: req.query.code}}))

  if (codeErr) return res.status(500).send({error: 'There was a problem finding the information in database'})
  if (!foundCode) return res.status(400).send({error: 'Code is incorrect'})

  const [clientErr, client] = await joinCatch(Client.findOne({where: {client_id: req.query.client_id}}))

  if (clientErr) return res.status(500).send({error: 'There was a problem finding the information in database'})
  if (!client) return res.status(400).send({error: 'Client not found'})

  if (req.query.redirect_uri !== foundCode.redirect_uri) return res.status(400).send({error: 'Redirect url is incorrect'})

  const destroyCode = (code) => new Promise(async resolve => {
    const [updateErr] = await joinCatch(code.destroy())
    if (updateErr) return res.status(500).send({error: 'There was a problem updating the information in database'})
    return resolve()
  })

  if (client.id !== foundCode.client_id)
    return destroyCode(foundCode).then(() => res.status(400).send({error: 'Client is incorrect'}))

  if (client.type === 'confidential' && decrypt(client.client_secret) !== req.query.client_secret)
    return destroyCode(foundCode).then(() => res.status(400).send({error: 'Client is incorrect'}))

  if (!(foundCode.code_challenge_method === 'S256' && verifyChallenge(req.query.code_verifier, foundCode.code_challenge)))
    return destroyCode(foundCode).then(() => res.status(400).send({error: 'Incorrect code verifier'}))



}
