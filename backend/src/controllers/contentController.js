import Asset from '../models/Asset.js'
import Game from '../models/Game.js'
import { seedAssets, seedGames } from '../data/seedData.js'
import asyncHandler from '../middlewares/asyncHandler.js'

function includeDrafts(request) {
  return request.query.includeDrafts === 'true'
}

function listQuery(onlyPublished = true) {
  return onlyPublished ? { isPublished: true } : {}
}

export function getHealth(_request, response) {
  response.json({
    status: 'ok',
    service: 'gameflow-api',
    timestamp: new Date().toISOString(),
  })
}

export const getContent = asyncHandler(async (request, response) => {
  const includeDraftsFlag = includeDrafts(request)
  const [games, assets] = await Promise.all([
    Game.find(listQuery(!includeDraftsFlag)).sort({ displayOrder: 1, createdAt: 1 }).lean(),
    Asset.find(listQuery(!includeDraftsFlag)).sort({ displayOrder: 1, createdAt: 1 }).lean(),
  ])

  const content = { games, assets }
  response.json(content)
})

export const getPublishedGames = asyncHandler(async (request, response) => {
  const games = await Game.find(listQuery(!includeDrafts(request)))
    .sort({ displayOrder: 1, createdAt: 1 })
    .lean()
  response.json(games)
})

export const getPublishedAssets = asyncHandler(async (request, response) => {
  const assets = await Asset.find(listQuery(!includeDrafts(request)))
    .sort({ displayOrder: 1, createdAt: 1 })
    .lean()
  response.json(assets)
})

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
