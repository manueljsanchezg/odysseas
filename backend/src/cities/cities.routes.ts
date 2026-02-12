import { Hono } from "hono"
import { jwt, JwtVariables } from "hono/jwt"
import authMiddleware from "../auth/auth.middleware"
import citiesService from "./cities.service"

interface City {
    id?: number
    name: string
    countryId: number
}

interface CityVariables extends JwtVariables {
    city: City
}

type Variables = CityVariables

export const citiesRoutes = new Hono<{ Variables: Variables }>()

citiesRoutes.use(
    '*',
    jwt({
        secret: process.env.JWT_SECRET_AT ?? 'jwt-secret-at',
    }),
    authMiddleware.checkRole('USER')
)

citiesRoutes.get('/:name', async (c) => {
  try {
    const name = c.req.param('name')

    const cities = await citiesService.findCitiesByName(name)

    return c.json(cities)
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ message: 'Server error: ' + error.message }, 500)
    }
    return c.json({ message: 'Server error: Unknown error' }, 500)
  }
})