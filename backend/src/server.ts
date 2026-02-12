import 'dotenv/config'

import { serve } from 'bun'
import { sql } from 'drizzle-orm'

import app from './index'
import db from './infra/db'

const PORT = Number(process.env.PORT) || 3000

async function main() {
  await db.execute(sql`SELECT 1`)
  console.log(`Database connection OK`)

  serve({
    port: PORT,
    fetch: app.fetch,
  })
  console.log(`Server running at http://localhost:${PORT}`)
}

main()
