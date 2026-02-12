import { Context, Next } from 'hono'

import tripService from './trip.service'

async function checkTripOwner(c: Context, next: Next) {
  try {
    const userId = c.get('jwtPayload')['sub']
    const tripId = Number(c.req.param('id'))

    const trip = await tripService.findTripByIdAndUserId(tripId, userId)

    if (!trip) return c.json({ message: 'Forbidden request' }, 404)

    c.set('trip', trip)

    await next()
  } catch {
    return c.json({ message: 'Server error' }, 500)
  }
}

export default { checkTripOwner }
