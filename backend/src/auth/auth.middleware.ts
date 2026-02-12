import { Context, Next } from 'hono'
import type { JwtVariables } from 'hono/jwt'

type Variables = JwtVariables

function checkRole(role: string) {
  return async (c: Context<{ Variables: Variables }>, next: Next) => {
    try {
      const tokenRole = c.get('jwtPayload')['role']

      if (tokenRole !== role) return c.json({ message: 'No authorized' }, 403)

      await next()
    } catch (error) {
      return c.json({ message: 'Server error', error: error }, 500)
    }
  }
}

export default { checkRole }
