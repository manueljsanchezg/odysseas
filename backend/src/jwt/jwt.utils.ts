import 'dotenv/config'

import { sign, verify } from 'hono/jwt'

const jwtSecretRt = process.env.JWT_SECRET_RT ?? 'jwt-secret-rt'
const jwtSecretAt = process.env.JWT_SECRET_AT ?? 'jwt-secret-at'

async function generateToken(userId: number, role: string, isRefresh: boolean) {
  const time = isRefresh ? 7 * 24 * 60 * 60 : 15 * 60

  const secret = isRefresh ? jwtSecretRt : jwtSecretAt

  const payload = {
    sub: userId,
    role,
    exp: Math.floor(Date.now() / 1000) + time,
  }
  const token = await sign(payload, secret)
  return token
}

async function verifyToken(token: string, isRefresh: boolean) {
  try {
    const secret = isRefresh ? jwtSecretRt : jwtSecretAt

    return await verify(token, secret)
  } catch (err) {
    console.error('JWT verification failed:', err)
    throw new Error('Invalid token')
  }
}

export default { generateToken, verifyToken }
