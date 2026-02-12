import 'dotenv/config'

import { sValidator } from '@hono/standard-validator'
import { Hono } from 'hono'
import type { JwtVariables } from 'hono/jwt'
import { jwt } from 'hono/jwt'

import authMiddleware from '../auth/auth.middleware'
import { Role } from '../infra/schema'
import userSchema from './user.schema'
import userService from './user.service'

type Variables = JwtVariables

export const userRoutes = new Hono<{ Variables: Variables }>()

userRoutes.use(
  '*',
  jwt({
    secret: process.env.JWT_SECRET_AT ?? 'jwt-secret-at',
  }),
  authMiddleware.checkRole('ADMIN')
)

userRoutes.get('/', async (c) => {
  try {
    const res = await userService.findAllUsers()
    return c.json(res)
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ message: 'Server error: ' + error.message }, 500)
    }
    return c.json({ message: 'Server error: Unknown error' }, 500)
  }
})

userRoutes.get('/:id', async (c) => {
  try {
    const userId = c.req.param('id')
    const user = await userService.findUserById(Number(userId))

    if (!user) return c.json({ message: 'User not found' }, 404)

    return c.json(user)
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ message: 'Server error: ' + error.message }, 500)
    }
    return c.json({ message: 'Server error: Unknown error' }, 500)
  }
})

userRoutes.post('/', sValidator('json', userSchema.createUserBody), async (c) => {
  try {
    const { username, password, role } = (await c.req.json()) as {
      username: string
      password: string
      role: Role
    }

    const user = await userService.findUserByUsername(username)

    if (user) return c.json({ message: 'This username already exists' }, 400)

    await userService.createUser(username, password, role)
    return c.json({ message: 'User created succesfuly' }, 201)
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ message: 'Server error: ' + error.message }, 500)
    }
    return c.json({ message: 'Server error: Unknown error' }, 500)
  }
})

userRoutes.delete('/:id', async (c) => {
  try {
    const userId = c.req.param('id')
    const user = await userService.findUserById(Number(userId))

    if (!user) return c.json({ message: 'User not found' }, 404)

    userService.deleteByUserId(Number(userId))

    return c.json({ message: 'User deleted succesfully' })
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ message: 'Server error: ' + error.message }, 500)
    }
    return c.json({ message: 'Server error: Unknown error' }, 500)
  }
})
