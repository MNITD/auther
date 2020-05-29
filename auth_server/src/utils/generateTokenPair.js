import jwt from 'jsonwebtoken'
import uuid4 from 'uuid/v4'

const {PRIVATE_KEY} = process.env

export const ACCESS_EXPIRATION_TIME = 5 * 60 * 1000
export const REFRESH_EXPIRATION_TIME = 60 * 60 * 1000

export const generateToken = (payload, options) => new Promise((res, rej) => {
  jwt.sign(payload, PRIVATE_KEY, options, (err, token) => {
    if (err) return rej(err)
    return res(token)
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
  return {access_token, refresh_token}
}

