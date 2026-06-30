import User from '../models/User.js'
import asyncHandler from './asyncHandler.js'
import { verifyToken } from '../utils/generateToken.js'

function createError(statusCode, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

export const protect = asyncHandler(async (request, _response, next) => {
  const authorization = request.headers.authorization ?? ''
  const [scheme, token] = authorization.split(' ')

  if (scheme !== 'Bearer' || !token) {
    throw createError(401, 'Authentication is required.')
  }

  const decoded = verifyToken(token)

  if (!decoded) {
    throw createError(401, 'Your session is invalid or expired.')
  }

  const user = await User.findById(decoded.sub).select('-password')

  if (!user) {
    throw createError(401, 'User account no longer exists.')
  }

  request.user = user
  next()
})

export const optionalProtect = asyncHandler(async (request, _response, next) => {
  const authorization = request.headers.authorization ?? ''
  const [scheme, token] = authorization.split(' ')

  if (scheme !== 'Bearer' || !token) {
    next()
    return
  }

  const decoded = verifyToken(token)

  if (!decoded) {
    next()
    return
  }

  const user = await User.findById(decoded.sub).select('-password')

  if (user) {
    request.user = user
  }

  next()
})
