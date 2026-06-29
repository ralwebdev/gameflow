import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { seedDatabase } from '../controllers/contentController.js'

try {
  await connectDatabase()
  await seedDatabase()
  console.log('GameFlow seed completed successfully.')
} catch (error) {
  console.error('GameFlow seed failed.', error)
  process.exitCode = 1
} finally {
  await disconnectDatabase().catch(() => {})
}
