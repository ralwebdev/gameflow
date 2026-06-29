import crypto from 'crypto'
import env from '../config/env.js'

function encode(value) {
  return Buffer.from(value).toString('base64url')
}

function decode(value) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

export function generateToken(payload) {
  const body = encode(JSON.stringify(payload))
  const signature = crypto
    .createHmac('sha256', env.authTokenSecret)
    .update(body)
    .digest('base64url')

  return `${body}.${signature}`
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') {
    return null
  }

  const [body, signature] = token.split('.')

  if (!body || !signature) {
    return null
  }

  const expectedSignature = crypto
    .createHmac('sha256', env.authTokenSecret)
    .update(body)
    .digest('base64url')

  const signatureBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null
  }

  try {
    const payload = JSON.parse(decode(body))

    if (!payload?.sub || !payload?.exp || Date.now() > payload.exp) {
      return null
    }

    return payload
  } catch {
    return null
  }
}
