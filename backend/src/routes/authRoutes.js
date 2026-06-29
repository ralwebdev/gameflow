import { Router } from 'express'
import {
  getCurrentUser,
  signinUser,
  signupUser,
  updateCurrentUserProfile,
} from '../controllers/authController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = Router()

router.post('/signup', signupUser)
router.post('/signin', signinUser)
router.get('/me', protect, getCurrentUser)
router.put('/profile', protect, updateCurrentUserProfile)

export default router
