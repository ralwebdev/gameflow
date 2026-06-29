import app from './app.js'
import { connectDatabase, disconnectDatabase } from './config/database.js'
import env from './config/env.js'
import { seedDatabase } from './controllers/contentController.js'

let server

async function startServer() {
  await connectDatabase()

  if (env.seedOnStart) {
    await seedDatabase()
  }

  server = app.listen(env.port, () => {
    console.log(`GameFlow API listening on http://localhost:${env.port}`)
  })
}

async function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down GameFlow API...`)

  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error)
          return
        }

        resolve()
      })
    })
  }

  await disconnectDatabase()
}

process.on('SIGINT', async () => {
  await shutdown('SIGINT')
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await shutdown('SIGTERM')
  process.exit(0)
})

startServer().catch(async (error) => {
  console.error('Unable to start GameFlow API', error)
  await disconnectDatabase().catch(() => {})
  process.exit(1)
})
