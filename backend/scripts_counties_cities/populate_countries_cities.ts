import { sql, eq } from "drizzle-orm"
import db from "../src/infra/db"
import { citiesTable, countriesTable } from "../src/infra/schema"

const COUNTRIES_URL = "https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/refs/heads/master/json/countries.json"
const CITIES_URL = "https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/refs/heads/master/json/countries%2Bcities.json"

async function main() {

    await db.delete(citiesTable) 
    await db.delete(countriesTable)

    console.log("Downloading countries...")

    const response_countries = await fetch(COUNTRIES_URL)
    const countriesData = await response_countries.json()

    const countries_parsed = countriesData.map((c: any) => ({
        "name": c.name,
        "isoCode": c.iso3,
        "continent": c.region || 'Unknown',
        "currency": c.currency || 'USD'
    }))

    console.log("Cleaning database...")

    await db.delete(citiesTable) 
    await db.delete(countriesTable)

    console.log("Inserting countries")
    await db.insert(countriesTable).values(countries_parsed)


    console.log("Mapping countries id")

    const dbCountries = await db.select({ 
        id: countriesTable.id, 
        name: countriesTable.name 
    }).from(countriesTable)

    const countryMap = new Map()
    dbCountries.forEach(row => countryMap.set(row.name, row.id))

    console.log("Downloading cities")
    const response_cities = await fetch(CITIES_URL)
    const citiesData = await response_cities.json()

    console.log("Processing cities")

    const citiesToDB: any[] = []

    for(const countryData of citiesData) {
        const countryId = countryMap.get(countryData.name)

        if (countryId && countryData.cities) {
            const currentCities = countryData.cities.map((cityName: string) => ({
                name: cityName,
                countryId: countryId
            }))
            citiesToDB.push(...currentCities)
        }
    }

    console.log(`Inserting ${citiesToDB.length} cities...`)
    
    const CHUNK_SIZE = 2000 
    
    let processed = 0;

    for (let i = 0; i < citiesToDB.length; i += CHUNK_SIZE) {
        const chunk = citiesToDB.slice(i, i + CHUNK_SIZE)
        
        await db.insert(citiesTable)
            .values(chunk)
            .onConflictDoNothing() 
        
        processed += chunk.length
        if (processed % 20000 === 0) {
            console.log(`Saved ${processed} / ${citiesToDB.length} cities...`)
        }
    }

    console.log("🎉 ¡Base de datos poblada con éxito!")
}

main().catch((err) => {
    console.error("❌ Error Fatal:", err)
    process.exit(1)
})