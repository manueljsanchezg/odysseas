import { eq, ilike, inArray } from 'drizzle-orm'
import db from '../infra/db'
import { citiesTable, countriesTable } from '../infra/schema'

async function findCitiesByName(name: string) {
  return await db.select({
    id: citiesTable.id,
    name: citiesTable.name,
    countryIso: countriesTable.isoCode
  })
  .from(citiesTable)
  .innerJoin(countriesTable, eq(citiesTable.countryId, countriesTable.id))
  .where(ilike(citiesTable.name, `${name}%`))
  .limit(20)
}

async function findCitiesByCitiesId(citiesId: number[]) {
  if (citiesId.length === 0) return []

  return await db.select()
  .from(citiesTable)
  .where(inArray(citiesTable.id, citiesId))
}

export default { findCitiesByCitiesId, findCitiesByName }
