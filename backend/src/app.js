import cors from 'cors'
import express from 'express'
import authRoutes from './routes/authRoutes.js'
import env from './config/env.js'
import contentRoutes from './routes/contentRoutes.js'
import { errorHandler, notFound } from './middlewares/errorMiddleware.js'

const app = express()

app.use(
  cors({
    origin: env.clientOrigin,
  }),
)
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api', contentRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
