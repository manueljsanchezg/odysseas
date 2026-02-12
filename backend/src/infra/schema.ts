import { relations, sql } from 'drizzle-orm'
import {
  check,
  date,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'

export const rolesEnum = pgEnum('roles', ['USER', 'ADMIN'])
export type Role = (typeof rolesEnum.enumValues)[number]

export const usersTable = pgTable(
  'users',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    username: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(),
    role: rolesEnum().default('USER').notNull(),
  },
  (t) => [uniqueIndex('username_idx').on(t.username)]
)

export const usersRelations = relations(usersTable, ({ many }) => ({
  refreshTokens: many(refreshTokensTable),
  trips: many(tripsTable),
}))

export const refreshTokensTable = pgTable(
  'refresh_tokens',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    token: text().notNull(),
    deviceId: varchar({ length: 255 }).notNull(),
    createdAt: timestamp().defaultNow(),
    expiresAt: timestamp().notNull(),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
  },
  (t) => [uniqueIndex('user_device_idx').on(t.deviceId, t.userId)]
)

export const refreshTokensRelations = relations(refreshTokensTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [refreshTokensTable.userId],
    references: [usersTable.id],
  }),
}))

export const tripStatusEnum = pgEnum('tripStatus', [
  'PLANNED',
  'ORGANIZED',
  'COMPLETED',
  'WISHLIST',
])

export type TripStatus = (typeof tripStatusEnum.enumValues)[number]

export const tripsTable = pgTable('trips', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }),
  status: tripStatusEnum().default('PLANNED').notNull(),
  startDate: date().notNull(),
  endDate: date().notNull(),
  userId: integer('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
})

export const tripsRelations = relations(tripsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [tripsTable.userId],
    references: [usersTable.id],
  }),
  activities: many(activitiesTable),
  tripCities: many(tripCitiesTable),
}))

export const activityTypeEnum = pgEnum('activity_type', [
  'FOOD',
  'RESTAURANT',
  'MUSEUM',
  'HISTORICAL_PLACE',
  'SPORT',
  'EVENT',
  'TRANSPORT',
  'SHOPPING',
  'NIGHTLIFE',
  'OTHER',
])

export type activityType = (typeof activityTypeEnum.enumValues)[number]

export const activitiesTable = pgTable(
  'activities',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    title: varchar({ length: 255 }).notNull(),
    description: varchar({ length: 255 }).notNull(),
    type: activityTypeEnum().default('OTHER').notNull(),
    date: date().notNull(),
    startDate: timestamp().notNull(),
    endDate: timestamp().notNull(),
    cost: numeric({ precision: 12, scale: 2 }).notNull(),
    rating: integer().notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}).notNull(),
    tripId: integer('trip_id')
      .notNull()
      .references(() => tripsTable.id, { onDelete: 'cascade' }),
  },
  (t) => [check('rating_rate', sql`${t.rating} >= 0 AND ${t.rating} <= 10`)]
)

export const activitiesRelations = relations(activitiesTable, ({ one }) => ({
  trip: one(tripsTable, {
    fields: [activitiesTable.tripId],
    references: [tripsTable.id],
  }),
}))

export const countriesTable = pgTable(
  'countries',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull().unique(),
    isoCode: varchar({ length: 10 }).notNull(),
    continent: varchar({ length: 255 }).notNull(),
    currency: varchar({ length: 20 }).notNull(),
  },
  (t) => [uniqueIndex('country_name_idx').on(t.name)]
)

export const countriesRelations = relations(countriesTable, ({ many }) => ({
  cities: many(citiesTable),
}))

export const citiesTable = pgTable(
  'cities',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    countryId: integer('country_id')
      .notNull()
      .references(() => countriesTable.id, { onDelete: 'cascade' }),
  },
  (t) => [uniqueIndex('city_name_idx').on(t.name)]
)

export const citiesRelations = relations(citiesTable, ({ one, many }) => ({
  country: one(countriesTable, {
    fields: [citiesTable.countryId],
    references: [countriesTable.id],
  }),
  tripCities: many(tripCitiesTable),
}))

export const tripCitiesTable = pgTable(
  'trip_cities',
  {
    tripId: integer('trip_id')
      .notNull()
      .references(() => tripsTable.id, { onDelete: 'cascade' }),
    cityId: integer('city_id')
      .notNull()
      .references(() => citiesTable.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.tripId, t.cityId] })]
)

export const tripCitiesRelations = relations(tripCitiesTable, ({ one }) => ({
  trip: one(tripsTable, {
    fields: [tripCitiesTable.tripId],
    references: [tripsTable.id],
  }),
  city: one(citiesTable, {
    fields: [tripCitiesTable.cityId],
    references: [citiesTable.id],
  }),
}))
