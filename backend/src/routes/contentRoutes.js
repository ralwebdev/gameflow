import express, { Router } from 'express'
import {
  createProject,
  getContent,
  getHealth,
  getProjectById,
  getPublishedAssets,
  getPublishedGames,
  getPublishedProjects,
  publishProject,
  uploadProjectFile,
  updateProject,
  updateContentEngagement,
  deleteProject,
} from '../controllers/contentController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = Router()

router.get('/health', getHealth)
router.get('/content', getContent)
router.get('/games', getPublishedGames)
router.get('/assets', getPublishedAssets)
router.get('/projects', getPublishedProjects)
router.get('/projects/:projectId', getProjectById)
router.post('/projects', protect, createProject)
router.patch('/projects/:projectId', protect, updateProject)
router.delete('/projects/:projectId', protect, deleteProject)
router.post('/content/:contentType/:contentId/engagement', protect, updateContentEngagement)
router.put(
  '/projects/:projectId/files',
  protect,
  express.raw({ type: 'application/octet-stream', limit: '250mb' }),
  uploadProjectFile,
)
router.post('/projects/:projectId/publish', protect, publishProject)

export default router
