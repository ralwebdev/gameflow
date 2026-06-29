import { Router } from 'express'
import {
  getContent,
  getHealth,
  getPublishedAssets,
  getPublishedGames,
} from '../controllers/contentController.js'

const router = Router()

router.get('/health', getHealth)
router.get('/content', getContent)
router.get('/games', getPublishedGames)
router.get('/assets', getPublishedAssets)

export default router
