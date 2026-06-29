import Asset from '../models/Asset.js'
import Game from '../models/Game.js'
import { seedAssets, seedGames } from '../data/seedData.js'

function listQuery(onlyPublished = true) {
  return onlyPublished ? { isPublished: true } : {}
}

export async function getGames({ includeDrafts = false } = {}) {
  return Game.find(listQuery(!includeDrafts)).sort({ displayOrder: 1, createdAt: 1 }).lean()
}

export async function getAssets({ includeDrafts = false } = {}) {
  return Asset.find(listQuery(!includeDrafts)).sort({ displayOrder: 1, createdAt: 1 }).lean()
}

export async function getHomepageContent({ includeDrafts = false } = {}) {
  const [games, assets] = await Promise.all([
    getGames({ includeDrafts }),
    getAssets({ includeDrafts }),
  ])

  return { games, assets }
}

export async function seedDatabase() {
  const [gameCount, assetCount] = await Promise.all([
    Game.estimatedDocumentCount(),
    Asset.estimatedDocumentCount(),
  ])

  if (gameCount === 0) {
    await Game.insertMany(seedGames)
  }

  if (assetCount === 0) {
    await Asset.insertMany(seedAssets)
  }
}
