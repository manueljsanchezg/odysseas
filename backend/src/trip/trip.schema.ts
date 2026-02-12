import * as v from 'valibot'

enum tripStatus {
  PLANNED = 'PLANNED',
  ORGANIZED = 'ORGANIZED',
  COMPLETED = 'COMPLETED',
  WISHLIST = 'WISHLIST',
}

const createTripBody = v.pipe(
  v.object({
    title: v.pipe(v.string(), v.maxLength(250), v.minLength(4)),
    description: v.optional(v.pipe(v.string(), v.maxLength(250))),
    status: v.enum(tripStatus),
    startDate: v.pipe(v.string(), v.isoDate()),
    endDate: v.pipe(v.string(), v.isoDate()),
  }),
  v.forward(
    v.check(
      (input) => new Date(input.endDate) > new Date(input.startDate),
      'The end date must be after start date'
    ),
    ['endDate']
  )
)

const createTripCityParams = v.object({
  id: v.pipe(v.string(), v.transform(Number), v.number()),
})

const createTripCityBody = v.object({
  citiesId: v.pipe(v.array(v.number()), v.minLength(1)),
})

export default { createTripBody, createTripCityParams, createTripCityBody }
