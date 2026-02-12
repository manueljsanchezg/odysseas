import { sValidator } from '@hono/standard-validator'
import { Hono } from 'hono'
import { jwt, JwtVariables } from 'hono/jwt'

import authMiddleware from '../auth/auth.middleware'
import citiesService from '../cities/cities.service'
import { TripStatus } from '../infra/schema'
import tripMiddleware from './trip.middleware'
import tripSchema from './trip.schema'
import tripService from './trip.service'

interface Trip {
  id?: number
  title: string
  description?: string
  status: TripStatus
  startDate: string
  endDate: string
}

export interface TripCity {
  tripId: number
  cityId: number
}

interface TripVariables extends JwtVariables {
  trip: Trip
}

type Variables = TripVariables

export const tripRoutes = new Hono<{ Variables: Variables }>()

tripRoutes.use(
  '*',
  jwt({
    secret: process.env.JWT_SECRET_AT ?? 'jwt-secret-at',
  }),
  authMiddleware.checkRole('USER')
)

tripRoutes.get('/', async (c) => {
  try {
    const userId = c.get('jwtPayload')['sub']

    const trips = await tripService.findAllTripsByUserId(userId)

    return c.json(trips)
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ message: 'Server error: ' + error.message }, 500)
    }
    return c.json({ message: 'Server error: Unknown error' }, 500)
  }
})

tripRoutes.get('/:id', tripMiddleware.checkTripOwner, async (c) => {
  try {
    const trip = c.get('trip')
    return c.json(trip)
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ message: 'Server error: ' + error.message }, 500)
    }
    return c.json({ message: 'Server error: Unknown error' }, 500)
  }
})

tripRoutes.post('/', sValidator('json', tripSchema.createTripBody), async (c) => {
  try {
    const { title, description, status, startDate, endDate } = await c.req.json() as Trip
    const userId = c.get('jwtPayload')['sub']

    const { tripId } = await tripService.createTrip(
      title,
      status,
      startDate,
      endDate,
      userId,
      description
    )

    return c.json({ message: 'Trip created succesfuly', tripId }, 201)
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ message: 'Server error: ' + error.message }, 500)
    }
    return c.json({ message: 'Server error: Unknown error' }, 500)
  }
})

tripRoutes.post(
  '/:id/cities',
  sValidator('param', tripSchema.createTripCityParams),
  sValidator('json', tripSchema.createTripCityBody),
  tripMiddleware.checkTripOwner,
  async (c) => {
    try {
      const tripId = Number(c.req.param('id'))
      console.log("Hola")
      const { citiesId } = await c.req.json() as { citiesId: number[] }

      const validCities = await citiesService.findCitiesByCitiesId(citiesId)
      if (validCities.length !== citiesId.length) {
        return c.json({ message: 'One or more cities do not exist' }, 400)
      }

      const existingTripCities = await tripService.getCitiesByTripId(tripId) 
      const existingCityIds = existingTripCities.map((tc: any) => tc.cityId)

      const newCityIds = citiesId.filter((id) => !existingCityIds.includes(id))

      if (newCityIds.length === 0) {
        return c.json({ message: 'All selected cities were already in the trip' }, 200)
      }

      const tripCitiesPayload: TripCity[] = newCityIds.map((cityId) => ({ 
        tripId: tripId, 
        cityId: cityId 
      }))

      await tripService.createTripCity(tripCitiesPayload)

      return c.json({ 
        message: `Successfully added ${newCityIds.length} cities`,
        addedCount: newCityIds.length 
      }, 201)

    } catch (error) {
      if (error instanceof Error) {
        return c.json({ message: 'Server error: ' + error.message }, 500)
      }
      return c.json({ message: 'Server error: Unknown error' }, 500)
    }
  }
)
