import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { createProject, publishProject, uploadProjectFile } from '../../lib/content'
import GltfAssetViewer from '../../components/GltfAssetViewer'
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  CloseIcon,
  EditIcon,
} from '../../components/icons/Icons'

const COLORS = {
  bg: '#0B0D12',
  surface: '#121620',
  elevated: 'rgba(255,255,255,0.06)',
  input: 'rgba(15,23,42,0.72)',
  border: 'rgba(255,255,255,0.08)',
  text: '#FFFFFF',
  textSecondary: '#B8C0CC',
  muted: '#7D8796',
  accent: '#FF7A59',
  success: '#22D3EE',
  primaryButton: '#F8F9FA',
  primaryButtonText: '#111827',
}

const TYPE_OPTIONS = [
  {
    value: 'game',
    label: 'WebGL Game',
    description: 'Upload a playable Unity, Godot, or custom WebGL build.',
  },
  {
    value: '3d',
    label: '3D Art / Model',
    description: 'Upload `.glb` or `.gltf` assets with textures.',
  },
  {
    value: '2d',
    label: '2D Art / Model',
    description: 'Upload image-based art, illustrations, or turnarounds.',
  },
]

const CATEGORY_OPTIONS = {
  game: ['Action', 'Puzzle', 'Arcade', 'Simulation', 'Strategy', 'Casual'],
  '3d': ['Character', 'Environment', 'Prop', 'Hard Surface', 'Sculpt', 'Vehicle'],
  '2d': ['Illustration', 'Concept Art', 'Texture', 'UI/UX', 'Poster', 'Sprite'],
}

const SOFTWARE_SUGGESTIONS = [
  'Unity',
  'Unreal Engine',
  'Blender',
  'Godot',
  'Maya',
  'ZBrush',
  'Substance Painter',
  'Photoshop',
  'After Effects',
]

const FILE_HINTS = {
  game: 'Pick the folder that contains your `index.html` file and all WebGL build files.',
  '3d': 'Upload the `.glb` or `.gltf` file, plus any textures or sidecar files in the same folder.',
  '2d': 'Upload the main image file for your artwork.',
}

const FIELD_STYLE = {
  minHeight: 56,
  borderRadius: 16,
  background: COLORS.input,
  border: `1px solid ${COLORS.border}`,
  color: COLORS.text,
  padding: '14px 18px',
  fontSize: 14,
  outline: 'none',
  width: '100%',
}

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** index
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`
}

function isImageFile(file) {
  return /\.(png|jpg|jpeg|webp|gif|avif)$/i.test(file?.name || '')
}

function isModelFile(file) {
  return /\.(glb|gltf)$/i.test(file?.name || '')
}

function isHtmlFile(file) {
  return /\.html?$/i.test(file?.name || '')
}

function useObjectUrl(file) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])

  useEffect(() => {
    if (!url) {
      return undefined
    }

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [url])

  return url
}

const StepBadge = ({ index, label, status }) => (
  <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 54 }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            status === 'done'
              ? COLORS.success
              : status === 'active'
                ? COLORS.accent
                : 'rgba(255,255,255,0.10)',
          color: status === 'upcoming' ? COLORS.muted : '#fff',
          fontSize: 12,
          fontWeight: 800,
          boxShadow: status === 'active' ? '0 8px 18px rgba(255,122,89,0.24)' : 'none',
        }}
      >
        {status === 'done' ? <CheckIcon size={14} weight="3" /> : index}
      </div>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color:
            status === 'done'
              ? COLORS.success
              : status === 'active'
                ? COLORS.text
                : COLORS.muted,
        }}
      >
        {label}
      </span>
    </div>
  </div>
)

const Chip = ({ value, onRemove, tone = 'default' }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '9px 14px',
      borderRadius: 999,
      background: tone === 'accent' ? 'rgba(255,122,89,0.18)' : 'rgba(255,255,255,0.08)',
      border: tone === 'accent' ? '1px solid rgba(255,122,89,0.35)' : `1px solid ${COLORS.border}`,
      color: COLORS.text,
      fontSize: 13,
      fontWeight: 600,
    }}
  >
    {value}
    {onRemove ? (
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${value}`}
        style={{
          width: 18,
          height: 18,
          padding: 0,
          border: 'none',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.12)',
          color: COLORS.text,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    ) : null}
  </div>
)

const UploadPage = () => {
  const navigate = useNavigate()
  const { isGuest, token } = useAuth()

  const [currentStep, setCurrentStep] = useState(1)
  const [projectType, setProjectType] = useState('game')
  const [mode, setMode] = useState('landscape')
  const [projectTitle, setProjectTitle] = useState('')
  const [category, setCategory] = useState(CATEGORY_OPTIONS.game[0])
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [software, setSoftware] = useState(['Blender'])
  const [softwareInput, setSoftwareInput] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [assetFiles, setAssetFiles] = useState([])
  const [coverFile, setCoverFile] = useState(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishedProject, setPublishedProject] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [toast, setToast] = useState(null)

  const currentCategories = CATEGORY_OPTIONS[projectType] || CATEGORY_OPTIONS.game

  const selectedMainFile = useMemo(() => {
    if (!assetFiles.length) {
      return null
    }

    const lowerFiles = [...assetFiles].filter((item) => !item.relativePath.toLowerCase().startsWith('cover/'))

    if (projectType === 'game') {
      return (
        lowerFiles.find((item) => isHtmlFile(item.file) && item.file.name.toLowerCase() === 'index.html')
        ?? lowerFiles.find((item) => isHtmlFile(item.file))
        ?? lowerFiles[0]
        ?? null
      )
    }

    if (projectType === '3d') {
      return (
        lowerFiles.find((item) => isModelFile(item.file) && item.file.name.toLowerCase().endsWith('.glb'))
        ?? lowerFiles.find((item) => isModelFile(item.file))
        ?? lowerFiles[0]
        ?? null
      )
    }

    return lowerFiles.find((item) => isImageFile(item.file)) ?? lowerFiles[0] ?? null
  }, [assetFiles, projectType])

  const mainPreviewUrl = useObjectUrl(selectedMainFile?.file || null)
  const coverPreviewUrl = useObjectUrl(coverFile?.file || null)
  const displayPreviewUrl = coverPreviewUrl || mainPreviewUrl
  const totalUploadSize = assetFiles.reduce((sum, item) => sum + item.file.size, 0) + (coverFile?.file.size || 0)
  const canGoNext =
    (currentStep === 1 && !!projectType) ||
    (currentStep === 2 && assetFiles.length > 0) ||
    (currentStep === 3 && !!projectTitle.trim() && !!category.trim()) ||
    currentStep >= 4

  const stepStatuses = [1, 2, 3, 4, 5].map((step) => ({
    index: step,
    label: ['Type', 'Assets', 'Info', 'Preview', 'Publish'][step - 1],
    status: currentStep > step ? 'done' : currentStep === step ? 'active' : 'upcoming',
  }))

  const removeAsset = (relativePath) => {
    setAssetFiles((prev) => prev.filter((item) => item.relativePath !== relativePath))
  }

  const addTag = () => {
    const nextTag = tagInput.trim().replace(/^#/, '')
    if (!nextTag) {
      return
    }

    if (!tags.includes(nextTag)) {
      setTags((prev) => [...prev, nextTag])
    }
    setTagInput('')
  }

  const addSoftware = () => {
    const nextSoftware = softwareInput.trim()
    if (!nextSoftware) {
      return
    }

    if (!software.includes(nextSoftware)) {
      setSoftware((prev) => [...prev, nextSoftware])
    }
    setSoftwareInput('')
  }

  const handleAssetSelection = (event) => {
    const fileList = Array.from(event.target.files || [])
    const nextAssets = fileList.map((file) => ({
      file,
      relativePath: (file.webkitRelativePath || file.name).replace(/\\/g, '/'),
    }))

    setAssetFiles(nextAssets)
    setErrorMessage('')
  }

  const handleCoverSelection = (event) => {
    const nextFile = event.target.files?.[0]
    if (!nextFile) {
      return
    }

    setCoverFile({
      file: nextFile,
      relativePath: `cover/${nextFile.name}`,
    })
  }

  const validateStep = (step) => {
    if (step === 1 && !projectType) {
      setErrorMessage('Please choose a project type.')
      return false
    }

    if (step === 2 && assetFiles.length === 0) {
      setErrorMessage('Please upload at least one asset file.')
      return false
    }

    if (step === 3) {
      if (!projectTitle.trim()) {
        setErrorMessage('Please add a project title.')
        return false
      }

      if (!category.trim()) {
        setErrorMessage('Please pick a category.')
        return false
      }
    }

    setErrorMessage('')
    return true
  }

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return
    }

    setCurrentStep((prev) => Math.min(prev + 1, 5))
  }

  const handleBack = () => {
    if (currentStep === 1) {
      navigate('/app/profile')
      return
    }

    setErrorMessage('')
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handlePublish = async () => {
    if (isGuest) {
      setToast({ action: 'publish projects' })
      return
    }

    if (!validateStep(3) || assetFiles.length === 0) {
      return
    }

    setIsPublishing(true)

    try {
      const draft = await createProject(token, {
        title: projectTitle.trim(),
        type: projectType,
        category: category.trim(),
        description: description.trim(),
        tags,
        software,
        visibility,
        mode,
      })

      const uploadQueue = [...assetFiles]

      if (coverFile) {
        uploadQueue.unshift(coverFile)
      }

      for (const item of uploadQueue) {
        const fileMeta = {
          name: item.file.name,
          relativePath: item.relativePath,
          mimeType: item.file.type || '',
        }
        await uploadProjectFile(token, draft.project.id, fileMeta, item.file)
      }

      const response = await publishProject(token, draft.project.id)

      setPublishedProject(response.project)
      setCurrentStep(5)
      setErrorMessage('')

      // Signal the feed to reload on next visit
      window.dispatchEvent(new CustomEvent('projectPublished', { detail: response.project }))
    } catch (error) {
      setErrorMessage(error.message || 'Failed to publish project.')
    } finally {
      setIsPublishing(false)
    }
  }

  const activeTypeMeta = TYPE_OPTIONS.find((item) => item.value === projectType) || TYPE_OPTIONS[0]

  const selectProjectType = (nextType) => {
    setProjectType(nextType)
    setCategory(CATEGORY_OPTIONS[nextType][0])
    setMode(nextType === '2d' ? 'portrait' : 'landscape')
  }

  return (
    <div
      className="mobile-frame anim-fade-up"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at top left, rgba(255,122,89,0.14), transparent 28%), radial-gradient(circle at top right, rgba(34,211,238,0.10), transparent 30%), linear-gradient(180deg, rgba(18,22,32,0.9) 0%, rgba(11,13,18,1) 26%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 18px 10px',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 18px)',
          flexShrink: 0,
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 800, color: COLORS.text, margin: 0, letterSpacing: -0.4 }}>
          New Project
        </h1>
        <button
          type="button"
          aria-label="Close"
          onClick={() => navigate('/app/profile')}
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.10)',
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            color: COLORS.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          }}
        >
          <CloseIcon size={20} />
        </button>
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '6px 18px 14px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {stepStatuses.map((step) => (
          <StepBadge key={step.index} index={step.index} label={step.label} status={step.status} />
        ))}
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 16px 0',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {errorMessage ? (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 16,
                background: 'rgba(255,122,89,0.14)',
                border: '1px solid rgba(255,122,89,0.28)',
                color: '#FFD9CF',
                fontSize: 13,
                lineHeight: 1.45,
                marginBottom: 14,
              }}
            >
              {errorMessage}
            </div>
          ) : null}

          <div
            style={{
              background: COLORS.elevated,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 28,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.30)',
              padding: 24,
            }}
          >
            {currentStep !== 5 ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 18,
                      background: 'rgba(255,255,255,0.08)',
                      position: 'relative',
                      overflow: 'hidden',
                      flexShrink: 0,
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {projectType === 'game' ? (
                      <div style={{ fontSize: 12, fontWeight: 800, textAlign: 'center', color: COLORS.textSecondary }}>
                        WEBGL
                      </div>
                    ) : projectType === '3d' ? (
                      <div style={{ fontSize: 12, fontWeight: 800, textAlign: 'center', color: COLORS.textSecondary }}>
                        3D
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, fontWeight: 800, textAlign: 'center', color: COLORS.textSecondary }}>
                        2D
                      </div>
                    )}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: -2,
                        right: -2,
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: 'rgba(18,22,32,0.96)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 18px rgba(0,0,0,.32)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: COLORS.text,
                      }}
                    >
                      <EditIcon size={11} />
                    </div>
                  </div>

                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: COLORS.text, margin: '0 0 4px', letterSpacing: -0.3 }}>
                      {currentStep === 1 && 'Choose your project type'}
                      {currentStep === 2 && 'Upload your assets'}
                      {currentStep === 3 && 'Tell us about your project'}
                      {currentStep === 4 && 'Preview your project'}
                    </h2>
                    <p style={{ fontSize: 13, color: COLORS.textSecondary, margin: 0, fontWeight: 500 }}>
                      {currentStep === 1 && activeTypeMeta.description}
                      {currentStep === 2 && FILE_HINTS[projectType]}
                      {currentStep === 3 && 'Add the details people will see when your project goes live.'}
                      {currentStep === 4 && 'Review the project before we publish it.'}
                    </p>
                  </div>
                </div>

                {currentStep === 1 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                      {TYPE_OPTIONS.map((option) => {
                        const selected = option.value === projectType
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => selectProjectType(option.value)}
                            style={{
                              width: '100%',
                              padding: 16,
                              borderRadius: 18,
                              border: `1px solid ${selected ? 'rgba(255,122,89,0.42)' : COLORS.border}`,
                              background: selected ? 'rgba(255,122,89,0.12)' : 'rgba(18,22,32,0.92)',
                              color: COLORS.text,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              textAlign: 'left',
                              cursor: 'pointer',
                            }}
                          >
                            <div>
                              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{option.label}</div>
                              <div style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.4 }}>
                                {option.description}
                              </div>
                            </div>
                            {selected ? <CheckIcon size={18} /> : <div style={{ width: 18, height: 18, borderRadius: 999, border: `1px solid ${COLORS.border}` }} />}
                          </button>
                        )
                      })}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: 'uppercase' }}>
                        Orientation
                      </label>
                      <div style={{ display: 'flex', gap: 10 }}>
                        {['portrait', 'landscape'].map((value) => {
                          const selected = mode === value
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setMode(value)}
                              style={{
                                flex: 1,
                                minHeight: 48,
                                borderRadius: 14,
                                border: `1px solid ${selected ? 'rgba(255,122,89,0.42)' : COLORS.border}`,
                                background: selected ? 'rgba(255,122,89,0.12)' : 'rgba(15,23,42,0.72)',
                                color: COLORS.text,
                                fontSize: 14,
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              {value === 'portrait' ? 'Portrait' : 'Landscape'}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ) : null}

                {currentStep === 2 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div
                      style={{
                        padding: 16,
                        borderRadius: 18,
                        background: 'rgba(18,22,32,0.92)',
                        border: `1px solid ${COLORS.border}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>Main assets</div>
                          <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{FILE_HINTS[projectType]}</div>
                        </div>
                        <label
                          style={{
                            padding: '8px 14px',
                            borderRadius: 999,
                            background: 'rgba(255,255,255,0.08)',
                            border: `1px solid ${COLORS.border}`,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            color: COLORS.text,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Choose Files
                          <input
                            type="file"
                            accept={
                              projectType === 'game'
                                ? '.html,.htm,.js,.json,.wasm,.data,.css,.png,.jpg,.jpeg,.webp,.mp3,.ogg'
                                : projectType === '3d'
                                  ? '.glb,.gltf,.bin,.png,.jpg,.jpeg,.webp'
                                  : '.png,.jpg,.jpeg,.webp,.gif,.avif'
                            }
                            multiple
                            {...(projectType === 'game' ? { webkitdirectory: '', directory: '' } : {})}
                            onChange={handleAssetSelection}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>

                      <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.5 }}>
                        For WebGL games, select the folder that contains <code>index.html</code>. For 3D projects,
                        upload the model file and its textures together. For 2D projects, the main image is enough.
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {assetFiles.length > 0 ? (
                          assetFiles.map((item) => (
                            <Chip
                              key={item.relativePath}
                              value={`${item.relativePath} (${formatBytes(item.file.size)})`}
                              onRemove={() => removeAsset(item.relativePath)}
                              tone={item === selectedMainFile ? 'accent' : 'default'}
                            />
                          ))
                        ) : (
                          <div style={{ fontSize: 13, color: COLORS.textSecondary }}>No files selected yet.</div>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: COLORS.textSecondary }}>
                        <span>{assetFiles.length} file(s)</span>
                        <span>{formatBytes(totalUploadSize)}</span>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: 16,
                        borderRadius: 18,
                        background: 'rgba(18,22,32,0.92)',
                        border: `1px solid ${COLORS.border}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>Cover image</div>
                          <div style={{ fontSize: 12, color: COLORS.textSecondary }}>
                            Optional, but recommended for games and 3D uploads.
                          </div>
                        </div>
                        <label
                          style={{
                            padding: '8px 14px',
                            borderRadius: 999,
                            background: 'rgba(255,255,255,0.08)',
                            border: `1px solid ${COLORS.border}`,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            color: COLORS.text,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Choose Cover
                          <input
                            type="file"
                            accept=".png,.jpg,.jpeg,.webp,.gif,.avif"
                            onChange={handleCoverSelection}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>

                      {coverFile ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                          <Chip value={`${coverFile.relativePath} (${formatBytes(coverFile.file.size)})`} tone="accent" />
                          <button
                            type="button"
                            onClick={() => setCoverFile(null)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: COLORS.accent,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div style={{ fontSize: 13, color: COLORS.textSecondary }}>No cover image selected.</div>
                      )}
                    </div>
                  </div>
                ) : null}

                {currentStep === 3 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: 'uppercase' }}>
                        Project Title
                      </label>
                      <input
                        type="text"
                        value={projectTitle}
                        onChange={(event) => setProjectTitle(event.target.value)}
                        placeholder="Neon Cube Composition"
                        style={FIELD_STYLE}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: 'uppercase' }}>
                        Category
                      </label>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                          style={{
                            ...FIELD_STYLE,
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            MozAppearance: 'none',
                            paddingRight: 44,
                          }}
                        >
                          {currentCategories.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                        <div
                          style={{
                            position: 'absolute',
                            top: '50%',
                            right: 14,
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none',
                            color: COLORS.textSecondary,
                          }}
                        >
                          <ChevronDownIcon size={18} />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: 'uppercase' }}>
                        Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        rows={5}
                        placeholder="Describe the idea, tools, and experience."
                        style={{
                          ...FIELD_STYLE,
                          minHeight: 120,
                          resize: 'vertical',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: 'uppercase' }}>
                        Tags
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {tags.map((tag) => (
                          <Chip key={tag} value={`#${tag}`} onRemove={() => setTags((prev) => prev.filter((item) => item !== tag))} tone="accent" />
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(event) => setTagInput(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ',') {
                              event.preventDefault()
                              addTag()
                            }
                          }}
                          placeholder="Add a tag"
                          style={{ ...FIELD_STYLE, flex: 1, minHeight: 48 }}
                        />
                        <button
                          type="button"
                          onClick={addTag}
                          style={{
                            minWidth: 96,
                            borderRadius: 14,
                            border: 'none',
                            background: COLORS.accent,
                            color: COLORS.text,
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: 'uppercase' }}>
                        Software Used
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {software.map((item) => (
                          <Chip key={item} value={item} onRemove={() => setSoftware((prev) => prev.filter((tool) => tool !== item))} />
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <input
                          type="text"
                          list="software-suggestions"
                          value={softwareInput}
                          onChange={(event) => setSoftwareInput(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ',') {
                              event.preventDefault()
                              addSoftware()
                            }
                          }}
                          placeholder="Add software"
                          style={{ ...FIELD_STYLE, flex: 1, minHeight: 48 }}
                        />
                        <button
                          type="button"
                          onClick={addSoftware}
                          style={{
                            minWidth: 96,
                            borderRadius: 14,
                            border: 'none',
                            background: 'rgba(255,255,255,0.08)',
                            color: COLORS.text,
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          Add
                        </button>
                      </div>
                      <datalist id="software-suggestions">
                        {SOFTWARE_SUGGESTIONS.map((item) => (
                          <option key={item} value={item} />
                        ))}
                      </datalist>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: 'uppercase' }}>
                        Visibility
                      </label>
                      <div style={{ display: 'flex', gap: 10 }}>
                        {['public', 'private'].map((item) => {
                          const selected = visibility === item
                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => setVisibility(item)}
                              style={{
                                flex: 1,
                                minHeight: 48,
                                borderRadius: 14,
                                border: `1px solid ${selected ? 'rgba(255,122,89,0.42)' : COLORS.border}`,
                                background: selected ? 'rgba(255,122,89,0.12)' : 'rgba(15,23,42,0.72)',
                                color: COLORS.text,
                                fontSize: 14,
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              {item === 'public' ? 'Public' : 'Private'}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ) : null}

                {currentStep === 4 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div
                      style={{
                        borderRadius: 22,
                        overflow: 'hidden',
                        border: `1px solid ${COLORS.border}`,
                        background: 'rgba(18,22,32,0.92)',
                      }}
                    >
                      {projectType === '3d' && selectedMainFile?.file && mainPreviewUrl ? (
                        <GltfAssetViewer
                          modelUrl={mainPreviewUrl}
                          title={projectTitle || '3D Preview'}
                          mode={mode}
                          background="#101820"
                        />
                      ) : projectType === '2d' && displayPreviewUrl ? (
                        <img
                          src={displayPreviewUrl}
                          alt="Project preview"
                          style={{ width: '100%', aspectRatio: mode === 'portrait' ? '3 / 4' : '16 / 10', objectFit: 'cover', display: 'block' }}
                        />
                      ) : (
                        <div
                          style={{
                            minHeight: 220,
                            padding: 20,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: 12,
                            background: 'linear-gradient(180deg, rgba(255,122,89,0.16), rgba(18,22,32,1))',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 800, color: COLORS.accent, marginBottom: 8 }}>
                              WebGL project bundle
                            </div>
                            <h3 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 800, letterSpacing: -0.4 }}>
                              {projectTitle || 'Untitled game'}
                            </h3>
                            <p style={{ margin: 0, fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.5 }}>
                              This bundle will run in-app after publishing. Make sure the folder contains `index.html`
                              and all of the build files the HTML references.
                            </p>
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {selectedMainFile ? (
                              <Chip value={`Main file: ${selectedMainFile.relativePath}`} tone="accent" />
                            ) : null}
                            <Chip value={`${assetFiles.length} uploaded file(s)`} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div style={{ padding: 14, borderRadius: 18, background: 'rgba(18,22,32,0.92)', border: `1px solid ${COLORS.border}` }}>
                        <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6 }}>Type</div>
                        <div style={{ fontSize: 15, fontWeight: 800 }}>{activeTypeMeta.label}</div>
                      </div>
                      <div style={{ padding: 14, borderRadius: 18, background: 'rgba(18,22,32,0.92)', border: `1px solid ${COLORS.border}` }}>
                        <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6 }}>Visibility</div>
                        <div style={{ fontSize: 15, fontWeight: 800 }}>{visibility === 'public' ? 'Public' : 'Private'}</div>
                      </div>
                      <div style={{ padding: 14, borderRadius: 18, background: 'rgba(18,22,32,0.92)', border: `1px solid ${COLORS.border}` }}>
                        <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6 }}>Assets</div>
                        <div style={{ fontSize: 15, fontWeight: 800 }}>{assetFiles.length} files</div>
                      </div>
                      <div style={{ padding: 14, borderRadius: 18, background: 'rgba(18,22,32,0.92)', border: `1px solid ${COLORS.border}` }}>
                        <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6 }}>Total Size</div>
                        <div style={{ fontSize: 15, fontWeight: 800 }}>{formatBytes(totalUploadSize)}</div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34,211,238,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(34,211,238,0.22)' }}>
                  <CheckIcon size={28} />
                </div>
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 8px', letterSpacing: -0.5 }}>
                    Project published
                  </h2>
                  <p style={{ margin: 0, color: COLORS.textSecondary, lineHeight: 1.5 }}>
                    Your project is now live in the feed and ready to be opened from the home screen.
                  </p>
                </div>

                <div style={{ width: '100%', padding: 16, borderRadius: 20, border: `1px solid ${COLORS.border}`, background: 'rgba(18,22,32,0.92)', textAlign: 'left' }}>
                  <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 6 }}>Published Project</div>
                  <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{publishedProject?.title || projectTitle}</div>
                  <div style={{ fontSize: 13, color: COLORS.textSecondary }}>{publishedProject?.type || projectType}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            position: 'sticky',
            bottom: 0,
            zIndex: 2,
            padding: '14px 16px calc(env(safe-area-inset-bottom, 0px) + 16px)',
            background: 'linear-gradient(180deg, rgba(11,13,18,0) 0%, rgba(11,13,18,0.88) 28%, rgba(11,13,18,1) 100%)',
          }}
        >
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              className="btn btn--ghost"
              style={{
                flex: 1,
                height: 56,
                borderRadius: 20,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: COLORS.text,
                boxShadow: 'none',
              }}
              onClick={handleBack}
            >
              {currentStep === 1 ? 'Back' : 'Back'}
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                className="btn btn--primary"
                style={{
                  flex: 1.5,
                  height: 56,
                  borderRadius: 20,
                  background: COLORS.primaryButton,
                  color: COLORS.primaryButtonText,
                  boxShadow: '0 14px 30px rgba(0,0,0,0.28)',
                  opacity: canGoNext ? 1 : 0.7,
                }}
                onClick={handleNext}
                disabled={!canGoNext}
              >
                Next
                <ArrowRightIcon size={18} />
              </button>
            ) : currentStep === 4 ? (
              <button
                type="button"
                className="btn btn--primary"
                style={{
                  flex: 1.5,
                  height: 56,
                  borderRadius: 20,
                  background: COLORS.primaryButton,
                  color: COLORS.primaryButtonText,
                  boxShadow: '0 14px 30px rgba(0,0,0,0.28)',
                  opacity: isPublishing ? 0.7 : 1,
                }}
                onClick={handlePublish}
                disabled={isPublishing}
              >
                {isPublishing ? 'Publishing...' : 'Publish Project'}
                <ArrowRightIcon size={18} />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn--primary"
                style={{
                  flex: 1.5,
                  height: 56,
                  borderRadius: 20,
                  background: COLORS.primaryButton,
                  color: COLORS.primaryButtonText,
                  boxShadow: '0 14px 30px rgba(0,0,0,0.28)',
                }}
                onClick={() => navigate('/app/home')}
              >
                Go to Feed
                <ArrowRightIcon size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {toast ? (
        <div
          style={{
            position: 'absolute',
            bottom: 112,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(34, 211, 238, 0.96)',
            color: '#0B0D12',
            padding: '12px 20px',
            borderRadius: 100,
            fontSize: 13,
            fontWeight: 700,
            zIndex: 1100,
            boxShadow: '0 8px 24px rgba(34, 211, 238, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 15 }}>OK</span>
          Sign in to {toast.action} on CreativeVerse.
          <button
            type="button"
            onClick={() => navigate('/signin')}
            style={{
              marginLeft: 8,
              border: 'none',
              background: 'rgba(11,13,18,0.1)',
              color: '#0B0D12',
              fontWeight: 800,
              borderRadius: 999,
              padding: '6px 10px',
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default UploadPage
