import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { rateLimiter } from "hono-rate-limiter";
import { authRoutes } from './auth/auth.routes'
import { tripRoutes } from './trip/trip.routes'
import { userRoutes } from './user/user.routes'
import { citiesRoutes } from './cities/cities.routes'

const app = new Hono()

const limiter = rateLimiter({
  windowMs: 5 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-6",
  keyGenerator: (c) => c.req.header("x-forwarded-for") || "",
})

app.use(limiter)

app.use(
  '*',
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
