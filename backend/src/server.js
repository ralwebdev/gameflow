import app from './app.js'
import { connectDatabase, disconnectDatabase } from './config/database.js'
import env from './config/env.js'
import { seedDatabase } from './controllers/contentController.js'
import { createServer } from 'http'
import { Server } from 'socket.io'

let server
let io

export { io }

async function startServer() {
  await connectDatabase()

  if (env.seedOnStart) {
    await seedDatabase()
  }

  server = createServer(app)

  io = new Server(server, {
    cors: {
      origin: env.clientOrigin,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
    }
  })

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id)

    socket.on('join_project', (projectId) => {
      socket.join(`project_${projectId}`)
    })

    socket.on('leave_project', (projectId) => {
      socket.leave(`project_${projectId}`)
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })

  server.listen(env.port, () => {
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
