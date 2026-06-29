import { Router } from 'express'
import { getAssets, getGames, getHomepageContent } from '../services/contentService.js'

const router = Router()

function includeDrafts(request) {
  return request.query.includeDrafts === 'true'
}

router.get('/health', (_request, response) => {
  response.json({
    status: 'ok',
    service: 'gameflow-api',
    timestamp: new Date().toISOString(),
  })
})

router.get('/content', async (request, response, next) => {
  try {
    const content = await getHomepageContent({ includeDrafts: includeDrafts(request) })
    response.json(content)
  } catch (error) {
    next(error)
  }
})

router.get('/games', async (request, response, next) => {
  try {
    const games = await getGames({ includeDrafts: includeDrafts(request) })
    response.json(games)
  } catch (error) {
    next(error)
  }
})

router.get('/assets', async (request, response, next) => {
  try {
    const assets = await getAssets({ includeDrafts: includeDrafts(request) })
    response.json(assets)
  } catch (error) {
    next(error)
  }
})

export default router
