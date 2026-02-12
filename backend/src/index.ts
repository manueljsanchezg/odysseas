import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { authRoutes } from './auth/auth.routes'
import { tripRoutes } from './trip/trip.routes'
import { userRoutes } from './user/user.routes'
import { citiesRoutes } from './cities/cities.routes'

const app = new Hono()

app.use(
  '/api/*',
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
)

app.get('/health', async (c) => {
  return c.text('Hello world!')
})

app.route('/api/v1/auth', authRoutes)
app.route('/api/v1/users', userRoutes)
app.route('/api/v1/trips', tripRoutes)
app.route('/api/v1/cities', citiesRoutes)

export default app
