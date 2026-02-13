import 'dotenv/config'

import { sValidator } from '@hono/standard-validator'
import { Hono } from 'hono'
import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie'
import { jwt, JwtVariables } from 'hono/jwt'

import jwtUtils from '../jwt/jwt.utils'
import userService from '../user/user.service'
import authSchema from './auth.schema'
import authService from './auth.service'

interface RegisterRequest {
  username: string
  password: string
}

interface LoginRequest extends RegisterRequest {
  deviceId: string
}

const isProd = process.env.NODE_ENV === 'production'
const site = isProd ? 'None' : 'Lax'
const cookieSecret = process.env.COOKIE_SECRET ?? 'cookie-secret'
const maxAgeInSeconds = 7 * 24 * 60 * 60

export const authRoutes = new Hono<{ Variables: JwtVariables }>()

authRoutes.post('/register', sValidator('json', authSchema.registerUserSchema), async (c) => {
  try {
    const { username, password } = (await c.req.json()) as RegisterRequest

    const user = await userService.findUserByUsername(username)

    if (user) return c.json({ message: 'This username already exists' }, 400)

    await userService.createUser(username, password)
    return c.json({ message: 'User created succesfuly' }, 201)
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ message: 'Server error: ' + error.message }, 500)
    }
    return c.json({ message: 'Server error: Unknown error' }, 500)
  }
})

authRoutes.post('/login', sValidator('json', authSchema.loginUserSchema), async (c) => {
  try {
    const { username, password, deviceId } = (await c.req.json()) as LoginRequest

    const user = await userService.findUserByUsername(username)

    if (!user) {
      return c.json({ message: 'Invalid credentials' }, 400)
    }

    const match = await Bun.password.verify(password, user.password)

    if (!match) {
      return c.json({ message: 'Invalid credentials' }, 400)
    }

    const accessToken = await jwtUtils.generateToken(user.id, user.role, false)

    const refreshToken = await jwtUtils.generateToken(user.id, user.role, true)

    const expiresAt = new Date(Date.now() + maxAgeInSeconds * 1000)

    await authService.createOrUpdateRefreshToken(refreshToken, deviceId, expiresAt, user.id)

    await setSignedCookie(c, 'refresh_token', refreshToken, cookieSecret, {
      secure: isProd,
      httpOnly: true,
      sameSite: site,
      maxAge: maxAgeInSeconds,
      path: '/',
    })

    return c.json({ token: accessToken, userId: user.id, role: user.role }, 200)
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ message: 'Server error: ' + error.message }, 500)
    }
    return c.json({ message: 'Server error: Unknown error' }, 500)
  }
})

authRoutes.post('/refresh', sValidator('json', authSchema.refreshSchema), async (c) => {
  try {
    const { deviceId } = (await c.req.json()) as { deviceId: string }

    const refreshToken = await getSignedCookie(c, cookieSecret, 'refresh_token')

    if (!refreshToken) return c.json({ message: 'Unauthorized' }, 401)

    const payload = await jwtUtils.verifyToken(refreshToken, true)

    const userId = payload.sub as number
    const role = payload.role as string

    const user = await userService.findUserById(userId)

    const hashedRefreshToken = await authService.findRefreshTokenByUserIdAndDeviceId(
      user.id,
      deviceId
    )

    if (!hashedRefreshToken) return c.json({ message: 'Unauthorized' }, 401)

    if (new Date(hashedRefreshToken.expiresAt) < new Date()) {
      deleteCookie(c, 'refresh_token')
      return c.json({ message: 'Refresh token expired' }, 401)
    }

    const match = await Bun.password.verify(refreshToken, hashedRefreshToken.token)

    if (!match) return c.json({ message: 'Unauthorized' }, 401)

    const newAccessToken = await jwtUtils.generateToken(userId, role, false)

    const newRefreshToken = await jwtUtils.generateToken(userId, role, true)

    const expiresAt = new Date(Date.now() + maxAgeInSeconds * 1000)

    await authService.updateRefreshToken(newRefreshToken, deviceId, expiresAt, userId)

    await setSignedCookie(c, 'refresh_token', newRefreshToken, cookieSecret, {
      secure: isProd,
      httpOnly: true,
      sameSite: site,
      maxAge: maxAgeInSeconds,
      path: '/',
    })

    return c.json({ token: newAccessToken, userId: user.id, role: user.role }, 200)
  } catch (error) {
    deleteCookie(c, 'refresh_token')
    return c.json({ message: 'Unauthorized', error: error }, 401)
  }
})

authRoutes.post('/logout', sValidator('json', authSchema.refreshSchema), async (c) => {
  try {
    const { deviceId } = (await c.req.json()) as { deviceId: string }

    const refreshToken = await getSignedCookie(c, cookieSecret, 'refresh_token')

    if (refreshToken) {
      const payload = await jwtUtils.verifyToken(refreshToken, true)
      await authService.deleteRefreshTokenByUserIdAndDeviceId(payload.sub as number, deviceId)
    }

    deleteCookie(c, 'refresh_token')

    return c.json({ message: 'Logout successful' }, 200)
  } catch (error) {
    deleteCookie(c, 'refresh_token')
    return c.json({ message: 'Server error', error: error }, 500)
  }
})

authRoutes.get(
  '/protected',
  jwt({
    secret: process.env.JWT_SECRET_AT ?? 'jwt-secret-at',
  }),
  async (c) => {
    try {
      const userId = c.get('jwtPayload')['sub']

      const user = await userService.findUserById(userId)

      if (!user) return c.json('No authorized', 401)

      return c.json({ success: true })
    } catch (error) {
      return c.json({ message: 'Server error', error: error }, 500)
    }
  }
)
