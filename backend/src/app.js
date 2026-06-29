import cors from 'cors'
import express from 'express'
import path from 'node:path'
import authRoutes from './routes/authRoutes.js'
import env from './config/env.js'
import contentRoutes from './routes/contentRoutes.js'
import { errorHandler, notFound } from './middlewares/errorMiddleware.js'

const app = express()
const uploadsRoot = path.join(process.cwd(), 'uploads')

function getUncompressedAssetPath(filePath) {
  const normalizedPath = String(filePath || '').replace(/\\/g, '/').toLowerCase()

  if (normalizedPath.endsWith('.br')) {
    return normalizedPath.slice(0, -3)
  }

  if (normalizedPath.endsWith('.gz')) {
    return normalizedPath.slice(0, -3)
  }

  if (normalizedPath.endsWith('.unityweb')) {
    return normalizedPath.slice(0, -9)
  }

  return normalizedPath
}

function getContentType(filePath) {
  const basePath = getUncompressedAssetPath(filePath)

  if (basePath.endsWith('.html')) return 'text/html; charset=utf-8'
  if (basePath.endsWith('.js')) return 'application/javascript; charset=utf-8'
  if (basePath.endsWith('.mjs')) return 'application/javascript; charset=utf-8'
  if (basePath.endsWith('.css')) return 'text/css; charset=utf-8'
  if (basePath.endsWith('.json')) return 'application/json; charset=utf-8'
  if (basePath.endsWith('.wasm')) return 'application/wasm'
  if (basePath.endsWith('.txt')) return 'text/plain; charset=utf-8'
  if (basePath.endsWith('.svg')) return 'image/svg+xml'
  if (basePath.endsWith('.png')) return 'image/png'
  if (basePath.endsWith('.jpg') || basePath.endsWith('.jpeg')) return 'image/jpeg'
  if (basePath.endsWith('.webp')) return 'image/webp'
  if (basePath.endsWith('.gif')) return 'image/gif'
  if (basePath.endsWith('.avif')) return 'image/avif'

  return 'application/octet-stream'
}

function setUploadHeaders(response, filePath) {
  const normalizedPath = String(filePath || '').replace(/\\/g, '/').toLowerCase()

  if (normalizedPath.endsWith('.br')) {
    response.setHeader('Content-Encoding', 'br')
  } else if (normalizedPath.endsWith('.gz') || normalizedPath.endsWith('.unityweb')) {
    response.setHeader('Content-Encoding', 'gzip')
  }

  response.setHeader('Content-Type', getContentType(filePath))
  response.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
}

app.use(
  cors({
    origin: env.clientOrigin,
  }),
)
// Profile images and project bundles are uploaded as base64 JSON payloads.
app.use(express.json({ limit: '150mb' }))

app.use(
  '/api/uploads',
  express.static(uploadsRoot, {
    setHeaders: setUploadHeaders,
  }),
)

app.use('/api/auth', authRoutes)
app.use('/api', contentRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
