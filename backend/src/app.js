import cors from 'cors'
import express from 'express'
import env from './config/env.js'
import contentRoutes from './routes/contentRoutes.js'

const app = express()

app.use(
  cors({
    origin: env.clientOrigin,
  }),
)
app.use(express.json())

app.use('/api', contentRoutes)

app.use((error, _request, response, _next) => {
  console.error(error)

  response.status(500).json({
    message: 'Something went wrong while handling the request.',
  })
})

export default app
