import { and, eq } from 'drizzle-orm'

import db from '../infra/db'
import { citiesTable, countriesTable, tripCitiesTable, tripsTable, TripStatus } from '../infra/schema'
import { TripCity } from './trip.routes'

async function createTrip(
  title: string,
  status: TripStatus,
  startDate: string,
  endDate: string,
  userId: number,
  description?: string
) {
  const insertedTrips = await db
    .insert(tripsTable)
    .values({ title, description, status, startDate, endDate, userId })
    .returning({ tripId: tripsTable.id })
  return insertedTrips[0]
}

async function findAllTripsByUserId(userId: number) {
  return await db.select().from(tripsTable).where(eq(tripsTable.userId, userId))
}

async function findTripByIdAndUserId(tripId: number, userId: number) {
  const tripResult = await db
    .select()
    .from(tripsTable)
    .where(and(eq(tripsTable.userId, userId), eq(tripsTable.id, tripId)))
    .limit(1)

  const trip = tripResult[0]
  
  if (!trip) return null

  const cities = await db
    .select({
      city: {
        id: citiesTable.id,
        name: citiesTable.name,
        countryIso: countriesTable.isoCode,
      }
    })
    .from(tripCitiesTable)
    .innerJoin(citiesTable, eq(tripCitiesTable.cityId, citiesTable.id))
    .innerJoin(countriesTable, eq(citiesTable.countryId, countriesTable.id))
    .where(eq(tripCitiesTable.tripId, tripId))

  return {
    ...trip,
    cities: cities 
  }
}

async function createTripCity(tipCities: TripCity[]) {
  return await db.insert(tripCitiesTable).values(tipCities)
}

async function getCitiesByTripId(tripId: number) {
  return await db.select().from(tripCitiesTable).where(eq(tripCitiesTable.tripId, tripId))
}

export default { createTrip, findAllTripsByUserId, findTripByIdAndUserId, createTripCity, getCitiesByTripId }
