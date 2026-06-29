import { Router } from 'express'
import {
  getCurrentUser,
  signinUser,
  signupUser,
} from '../controllers/authController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = Router()

router.post('/signup', signupUser)
router.post('/signin', signinUser)
router.get('/me', protect, getCurrentUser)

export default router
