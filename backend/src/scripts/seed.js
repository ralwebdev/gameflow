import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { seedDatabase } from '../services/contentService.js'

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
