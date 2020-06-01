import jwt from 'jsonwebtoken'
import {v4 as uuid4} from 'uuid'
import fs from 'fs'
import path from 'path'
import {JWK} from 'node-jose'

export const ACCESS_EXPIRATION_TIME = 5 * 60 * 1000 // 5 minutes
export const REFRESH_EXPIRATION_TIME = 60 * 60 * 1000 // 60 minutes

export const generateToken = (payload, options) => new Promise((res, rej) => {
  fs.readFile(path.resolve(__dirname, '../data/keypair.json'), async (err, data) => {
    try {
      const {privateKey} = JSON.parse(data)
      const jwk = await JWK.asKey(privateKey, 'pem')
      jwt.sign(payload, privateKey, {...options, keyid: jwk.kid}, (err, token) => {
        if (err) return rej(err)
        return res(token)
      })
    } catch (err) {
      return rej(err)
    }
  })
})

export const generateTokenPair = async (scopes, audience, subject, refreshId) => {
  const commonOptions = {
    audience,
    subject,
    algorithm: 'RS256',
  }
  const accessOptions = {
    ...commonOptions,
    jwtid: uuid4(),
    expiresIn: ACCESS_EXPIRATION_TIME,
  }
  const refreshOptions = {
    ...commonOptions,
    jwtid: refreshId,
    expiresIn: REFRESH_EXPIRATION_TIME,
  }
  const [access_token, refresh_token] = await Promise.all([
    generateToken({scopes}, accessOptions),
    generateToken({scopes}, refreshOptions),
  ])
  const expired_at = Date.now() + ACCESS_EXPIRATION_TIME
  const refresh_expired_at = Date.now() + REFRESH_EXPIRATION_TIME
  return {access_token, refresh_token, expired_at, refresh_expired_at, token_type: "bearer"}
}

export const verifyToken = (token, options) => new Promise((res, rej) => {
  fs.readFile(path.resolve(__dirname, '../data/keypair.json'), (err, data) => {
    try {
      const {publicKey} = JSON.parse(data)
      jwt.verify(token, publicKey, options, (err, decoded) => {
        if (err) return rej(err)
        return res(decoded)
      })
    } catch (err) {
      return rej(err)
    }
  })
})
