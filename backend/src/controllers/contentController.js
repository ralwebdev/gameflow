import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import mongoose from 'mongoose'
import Asset from '../models/Asset.js'
import Game from '../models/Game.js'
import Project from '../models/Project.js'
import { seedAssets, seedGames } from '../data/seedData.js'
import asyncHandler from '../middlewares/asyncHandler.js'

const UPLOADS_ROOT = path.join(process.cwd(), 'uploads', 'projects')
const PUBLIC_UPLOADS_PREFIX = '/api/uploads/projects'

function includeDrafts(request) {
  return request.query.includeDrafts === 'true'
}

function listQuery(onlyPublished = true) {
  return onlyPublished ? { isPublished: true } : {}
}

function createError(statusCode, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'project'
}

function safeRelativePath(inputPath, fallbackName) {
  const rawPath = String(inputPath || fallbackName || '').replace(/\\/g, '/').trim()

  if (!rawPath) {
    throw createError(400, 'Every uploaded file needs a name.')
  }

  const normalized = path.posix.normalize(rawPath)

  if (
    normalized.startsWith('../') ||
    normalized === '..' ||
    normalized.includes(':/') ||
    normalized.startsWith('/')
  ) {
    throw createError(400, `Invalid upload path: ${rawPath}`)
  }

  return normalized
}

function decodeDataUrl(dataUrl) {
  if (typeof dataUrl !== 'string' || !dataUrl.trim()) {
    throw createError(400, 'Missing uploaded file data.')
  }

  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)

  if (!match) {
    throw createError(400, 'Uploaded files must be sent as data URLs.')
  }

  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], 'base64'),
  }
}

function normalizeList(input) {
  if (!Array.isArray(input)) {
    return []
  }

  return input
    .map((item) => String(item || '').trim())
    .filter(Boolean)
}

function toPublicUrl(relativePath) {
  return `${PUBLIC_UPLOADS_PREFIX}/${relativePath.replace(/\\/g, '/')}`
}

function getProjectRoot(projectSlug) {
  return path.join(UPLOADS_ROOT, projectSlug)
}

function getProjectFilePath(projectSlug, relativePath) {
  return path.join(getProjectRoot(projectSlug), safeRelativePath(relativePath))
}

function normalizeRelativeUrl(relativeUrl) {
  return String(relativeUrl || '')
    .replace(/\\/g, '/')
    .split('?')[0]
    .split('#')[0]
    .trim()
}

function extractAssetReferences(htmlContent) {
  const references = new Set()
  const patterns = [
    /(?:src|href|data|codebase)=["']([^"'<>]+)["']/gi,
    /url\(\s*["']?([^"')]+)["']?\s*\)/gi,
  ]

  for (const pattern of patterns) {
    let match = pattern.exec(htmlContent)
    while (match) {
      const reference = normalizeRelativeUrl(match[1])
      if (
        reference &&
        !reference.startsWith('/') &&
        !reference.startsWith('data:') &&
        !reference.startsWith('blob:') &&
        !reference.startsWith('http://') &&
        !reference.startsWith('https://') &&
        !reference.startsWith('//') &&
        !reference.startsWith('mailto:')
      ) {
        references.add(reference)
      }
      match = pattern.exec(htmlContent)
    }
  }

  return [...references]
}

function resolveProjectRelativePath(basePath, referencePath) {
  const normalizedReference = normalizeRelativeUrl(referencePath)

  if (!normalizedReference) {
    return ''
  }

  const baseDir = normalizeRelativeUrl(basePath)
  const joinedPath = path.posix.normalize(path.posix.join(path.posix.dirname(baseDir), normalizedReference))

  if (
    joinedPath.startsWith('../') ||
    joinedPath === '..' ||
    joinedPath.startsWith('/') ||
    joinedPath.includes(':/')
  ) {
    return ''
  }

  return joinedPath
}

async function validatePlayableGameBundle(project) {
  const uploadedFiles = Array.isArray(project.uploadedFiles) ? project.uploadedFiles : []
  const indexFile = uploadedFiles.find((file) => file.relativePath.toLowerCase().endsWith('index.html'))

  if (!indexFile) {
    throw createError(400, 'A WebGL project needs an index.html entry file.')
  }

  const indexPath = getProjectFilePath(project.slug, indexFile.relativePath)
  const indexHtml = await fs.readFile(indexPath, 'utf8')
  const referencedAssets = extractAssetReferences(indexHtml)

  const availablePaths = new Set(
    uploadedFiles.map((file) => normalizeRelativeUrl(file.relativePath)),
  )

  const missingAssets = referencedAssets
    .map((reference) => resolveProjectRelativePath(indexFile.relativePath, reference))
    .filter((referencePath) => referencePath && !availablePaths.has(referencePath))

  if (missingAssets.length > 0) {
    const sampleMissing = missingAssets.slice(0, 5).join(', ')
    throw createError(
      400,
      `Your WebGL build is incomplete. Missing referenced file(s): ${sampleMissing}. Upload the full Unity WebGL build folder, including the Build files and any compressed .br assets.`,
    )
  }
}

function pickMainFile(uploadedFiles, type) {
  const byRelativePath = [...uploadedFiles]
    .filter((file) => !file.relativePath.toLowerCase().startsWith('cover/'))
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath))

  if (type === 'game') {
    const htmlFile = byRelativePath.find((file) => file.relativePath.toLowerCase().endsWith('index.html'))
      ?? byRelativePath.find((file) => file.relativePath.toLowerCase().endsWith('.html'))

    return htmlFile ?? null
  }

  if (type === '3d') {
    const glbFile = byRelativePath.find((file) => file.relativePath.toLowerCase().endsWith('.glb'))
      ?? byRelativePath.find((file) => file.relativePath.toLowerCase().endsWith('.gltf'))

    return glbFile ?? null
  }

  if (type === '2d') {
    const imageFile = byRelativePath.find((file) =>
      ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif'].some((ext) =>
        file.relativePath.toLowerCase().endsWith(ext),
      ),
    )

    return imageFile ?? null
  }

  return null
}

function safeAvatarUrl(avatar) {
  // Strip huge base64 data URLs — only keep external/CDN URLs
  if (typeof avatar === 'string' && avatar.startsWith('data:')) {
    return ''
  }
  return avatar || ''
}

function buildProjectPayload(project) {
  return {
    id: String(project._id),
    ownerId: String(project.ownerId),
    ownerUsername: project.ownerUsername,
    ownerName: project.ownerName,
    ownerAvatar: safeAvatarUrl(project.ownerAvatar),
    type: project.type,
    title: project.title,
    slug: project.slug,
    category: project.category,
    description: project.description,
    tags: project.tags,
    software: project.software,
    mode: project.mode,
    visibility: project.visibility,
    isPublished: project.isPublished,
    previewUrl: project.previewUrl,
    gameUrl: project.gameUrl,
    modelUrl: project.modelUrl,
    imageUrl: project.imageUrl,
    uploadedFiles: project.uploadedFiles,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  }
}

async function storeProjectFiles(projectSlug, files = []) {
  const savedFiles = []
  const baseDir = getProjectRoot(projectSlug)
  const normalizedBaseDir = `${path.normalize(baseDir)}${path.sep}`

  await fs.mkdir(baseDir, { recursive: true })

  for (const file of files) {
    const relativePath = safeRelativePath(file.relativePath, file.name)
    const targetPath = path.join(baseDir, relativePath)
    const normalizedTarget = path.normalize(targetPath)

    if (!normalizedTarget.startsWith(normalizedBaseDir)) {
      throw createError(400, `Refusing to write outside the project folder: ${relativePath}`)
    }

    await fs.mkdir(path.dirname(normalizedTarget), { recursive: true })

    const { buffer, mimeType } = decodeDataUrl(file.dataUrl)
    await fs.writeFile(normalizedTarget, buffer)

    savedFiles.push({
      name: String(file.name || path.basename(relativePath)),
      relativePath,
      url: toPublicUrl(`${projectSlug}/${relativePath}`),
      mimeType: file.mimeType || mimeType || '',
      size: buffer.length,
    })
  }

  return savedFiles
}

async function writeProjectFile(projectSlug, fileMeta, buffer) {
  const baseDir = getProjectRoot(projectSlug)
  const normalizedBaseDir = `${path.normalize(baseDir)}${path.sep}`
  const relativePath = safeRelativePath(fileMeta.relativePath, fileMeta.name)
  const targetPath = path.join(baseDir, relativePath)
  const normalizedTarget = path.normalize(targetPath)

  if (!normalizedTarget.startsWith(normalizedBaseDir)) {
    throw createError(400, `Refusing to write outside the project folder: ${relativePath}`)
  }

  await fs.mkdir(path.dirname(normalizedTarget), { recursive: true })
  await fs.writeFile(normalizedTarget, buffer)

  return {
    name: String(fileMeta.name || path.basename(relativePath)),
    relativePath,
    url: toPublicUrl(`${projectSlug}/${relativePath}`),
    mimeType: fileMeta.mimeType || '',
    size: buffer.length,
  }
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
  const [games, assets, projects] = await Promise.all([
    Game.find(listQuery(!includeDraftsFlag)).sort({ displayOrder: 1, createdAt: 1 }).lean(),
    Asset.find(listQuery(!includeDraftsFlag)).sort({ displayOrder: 1, createdAt: 1 }).lean(),
    Project.find(listQuery(!includeDraftsFlag)).sort({ createdAt: -1 }).lean(),
  ])

  const content = { games, assets, projects: projects.map(buildProjectPayload) }
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

export const getPublishedProjects = asyncHandler(async (request, response) => {
  const projects = await Project.find(listQuery(!includeDrafts(request)))
    .sort({ displayOrder: 1, createdAt: -1 })
    .lean()
  response.json(projects.map(buildProjectPayload))
})

export const getProjectById = asyncHandler(async (request, response) => {
  const { projectId } = request.params

  const query = mongoose.Types.ObjectId.isValid(projectId)
    ? { $or: [{ _id: projectId }, { slug: String(projectId).toLowerCase() }] }
    : { slug: String(projectId).toLowerCase() }

  const project = await Project.findOne(query).lean()

  if (!project) {
    throw createError(404, 'Project not found.')
  }

  response.json({ project: buildProjectPayload(project) })
})

export const createProject = asyncHandler(async (request, response) => {
  const {
    title,
    type,
    category,
    description,
    tags,
    software,
    visibility,
    mode,
  } = request.body ?? {}

  const normalizedTitle = String(title || '').trim()
  const normalizedType = String(type || '').trim()
  const normalizedCategory = String(category || '').trim()
  const normalizedDescription = String(description || '').trim()
  const normalizedVisibility = visibility === 'private' ? 'private' : 'public'
  const normalizedMode = mode === 'portrait' ? 'portrait' : 'landscape'
  const normalizedTags = normalizeList(tags)
  const normalizedSoftware = normalizeList(software)

  if (!normalizedTitle) {
    throw createError(400, 'Project title is required.')
  }

  if (!['game', '3d', '2d'].includes(normalizedType)) {
    throw createError(400, 'Please choose a valid project type.')
  }

  if (!normalizedCategory) {
    throw createError(400, 'Project category is required.')
  }

  const existingOwnerProjects = await Project.countDocuments({ ownerId: request.user._id })
  const slugBase = `${slugify(normalizedTitle)}-${crypto.randomUUID().slice(0, 8)}`
  const projectSlug = slugBase

  const project = await Project.create({
    ownerId: request.user._id,
    ownerUsername: request.user.username,
    ownerName: request.user.name,
    ownerAvatar: safeAvatarUrl(request.user.avatar),
    type: normalizedType,
    title: normalizedTitle,
    slug: projectSlug,
    category: normalizedCategory,
    description: normalizedDescription,
    tags: normalizedTags,
    software: normalizedSoftware,
    mode: normalizedMode,
    visibility: normalizedVisibility,
    isPublished: false,
    previewUrl: '',
    gameUrl: '',
    modelUrl: '',
    imageUrl: '',
    uploadedFiles: [],
    displayOrder: existingOwnerProjects + 1,
  })

  response.status(201).json({
    message: 'Project draft created successfully.',
    project: buildProjectPayload(project),
  })
})

export const uploadProjectFile = asyncHandler(async (request, response) => {
  const { projectId } = request.params
  const fileName = String(request.headers['x-file-name'] || '').trim()
  const relativePath = String(request.headers['x-relative-path'] || '').trim()
  const mimeType = String(request.headers['x-mime-type'] || '').trim()
  const buffer = request.body

  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw createError(400, 'Uploaded file content is missing.')
  }

  if (!fileName || !relativePath) {
    throw createError(400, 'Uploaded files require a file name and relative path.')
  }

  const project = await Project.findById(projectId)

  if (!project) {
    throw createError(404, 'Project not found.')
  }

  if (String(project.ownerId) !== String(request.user._id)) {
    throw createError(403, 'You cannot modify this project.')
  }

  const savedFile = await writeProjectFile(project.slug, { name: fileName, relativePath, mimeType }, buffer)

  const existingFiles = Array.isArray(project.uploadedFiles) ? project.uploadedFiles : []
  const nextFiles = [
    ...existingFiles.filter((file) => file.relativePath !== savedFile.relativePath),
    savedFile,
  ].sort((a, b) => a.relativePath.localeCompare(b.relativePath))

  project.uploadedFiles = nextFiles
  await project.save()

  response.status(201).json({
    message: 'File uploaded successfully.',
    file: savedFile,
  })
})

export const publishProject = asyncHandler(async (request, response) => {
  const { projectId } = request.params
  const project = await Project.findById(projectId)

  if (!project) {
    throw createError(404, 'Project not found.')
  }

  if (String(project.ownerId) !== String(request.user._id)) {
    throw createError(403, 'You cannot publish this project.')
  }

  if (!Array.isArray(project.uploadedFiles) || project.uploadedFiles.length === 0) {
    throw createError(400, 'Please upload at least one file before publishing.')
  }

  const mainFile = pickMainFile(project.uploadedFiles, project.type)

  if (!mainFile) {
    throw createError(
      400,
      project.type === 'game'
        ? 'A WebGL project needs an index.html or another .html entry file.'
        : project.type === '3d'
          ? 'A 3D project needs a .glb or .gltf file.'
        : 'A 2D project needs an image file.',
    )
  }

  if (project.type === 'game') {
    await validatePlayableGameBundle(project)
  }

  const coverFile = project.uploadedFiles.find((file) => file.relativePath.toLowerCase().startsWith('cover/'))
    ?? project.uploadedFiles.find((file) => ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif'].some((ext) => file.relativePath.toLowerCase().endsWith(ext)))
    ?? null

  project.previewUrl = coverFile?.url ?? mainFile.url
  project.gameUrl = project.type === 'game' ? mainFile.url : ''
  project.modelUrl = project.type === '3d' ? mainFile.url : ''
  project.imageUrl = project.type === '2d' ? mainFile.url : ''
  project.isPublished = project.visibility === 'public'

  await project.save()

  response.json({
    message: 'Project published successfully.',
    project: buildProjectPayload(project),
  })
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
