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
} from '../../components/icons/Icons'

/* ─── Design tokens ────────────────────────────────────────────────────── */
const C = {
  bg:          '#0D1117',
  surface:     '#131920',
  card:        '#1A2030',
  cardHover:   '#1F2638',
  border:      'rgba(255,255,255,0.07)',
  borderHover: 'rgba(255,255,255,0.14)',
  text:        '#F0F4FF',
  sub:         '#8892A4',
  muted:       'rgba(255,255,255,0.28)',
  accent:      '#FF7A45',
  accentDim:   'rgba(255,122,69,0.12)',
  accentBorder:'rgba(255,122,69,0.28)',
  success:     '#34D399',
  successDim:  'rgba(52,211,153,0.1)',
}

/* ─── Inline SVG icons for the 3 type cards ────────────────────────────── */
const GamepadIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="11" x2="10" y2="11"/><line x1="8" y1="9" x2="8" y2="13"/>
    <line x1="15" y1="12" x2="15.01" y2="12"/><line x1="18" y1="10" x2="18.01" y2="10"/>
    <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258A4 4 0 0 0 17.32 5z"/>
  </svg>
)

const CubeIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)

const ImageIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)

const UploadCloudIcon = ({ size = 28, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/>
    <line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
)

const ImagePlusIcon = ({ size = 28, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
    <line x1="16" y1="5" x2="16" y2="11"/>
    <line x1="13" y1="8" x2="19" y2="8"/>
  </svg>
)

const EyeIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const LockIcon2 = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const GlobeIcon2 = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
)

/* ─── Static data ───────────────────────────────────────────────────────── */
const TYPE_OPTIONS = [
  {
    value: 'game',
    label: 'WebGL Game',
    description: 'Playable Unity, Godot, or custom WebGL build.',
    Icon: GamepadIcon,
  },
  {
    value: '3d',
    label: '3D Art / Model',
    description: 'Upload .glb or .gltf assets with textures.',
    Icon: CubeIcon,
  },
  {
    value: '2d',
    label: '2D Art / Illustration',
    description: 'Images, concept art, posters, or turnarounds.',
    Icon: ImageIcon,
  },
]

const CATEGORY_OPTIONS = {
  game: ['Action', 'Puzzle', 'Arcade', 'Simulation', 'Strategy', 'Casual'],
  '3d': ['Character', 'Environment', 'Prop', 'Hard Surface', 'Sculpt', 'Vehicle'],
  '2d': ['Illustration', 'Concept Art', 'Texture', 'UI/UX', 'Poster', 'Sprite'],
}

const SOFTWARE_SUGGESTIONS = [
  'Unity', 'Unreal Engine', 'Blender', 'Godot', 'Maya',
  'ZBrush', 'Substance Painter', 'Photoshop', 'After Effects',
]

const FILE_HINTS = {
  game: 'Select the folder that contains your index.html and all WebGL build files.',
  '3d': 'Upload the .glb or .gltf file, plus any textures or sidecar files.',
  '2d': 'Upload the main image file for your artwork.',
}

const STEP_LABELS = ['Type', 'Assets', 'Info', 'Preview', 'Publish']

/* ─── Helpers ───────────────────────────────────────────────────────────── */
function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const v = bytes / 1024 ** i
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`
}
const isImageFile = (f) => /\.(png|jpg|jpeg|webp|gif|avif)$/i.test(f?.name || '')
const isModelFile = (f) => /\.(glb|gltf)$/i.test(f?.name || '')
const isHtmlFile  = (f) => /\.html?$/i.test(f?.name || '')

function useObjectUrl(file) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])
  useEffect(() => { if (url) return () => URL.revokeObjectURL(url) }, [url])
  return url
}

/* ─── Sub-components ────────────────────────────────────────────────────── */
const StepDot = ({ index, label, status }) => {
  const active = status === 'active'
  const done   = status === 'done'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 2 }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? C.accent : done ? '#1E1715' : '#0D1117',
        border: `1.5px solid ${active ? C.accent : done ? C.accentBorder : 'rgba(255,255,255,0.10)'}`,
        color: active ? '#fff' : done ? C.accent : C.muted,
        fontSize: 11, fontWeight: 600,
        transition: 'all 0.25s ease',
        zIndex: 2,
        boxShadow: active ? '0 0 0 4px rgba(255,122,69,0.12)' : 'none',
      }}>
        {done ? <CheckIcon size={13} color={C.accent} weight="3" /> : index}
      </div>
      <span style={{
        marginTop: 6, fontSize: 10.5, fontWeight: active ? 600 : 400,
        color: active ? C.text : done ? C.sub : C.muted,
        transition: 'color 0.2s',
        letterSpacing: '0.01em',
      }}>
        {label}
      </span>
    </div>
  )
}

const FormLabel = ({ children }) => (
  <label style={{
    display: 'block',
    fontSize: 11.5, fontWeight: 600, letterSpacing: '0.07em',
    textTransform: 'uppercase', color: C.sub,
    marginBottom: 8,
  }}>
    {children}
  </label>
)

const Tag = ({ value, onRemove, accent }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '5px 10px',
    borderRadius: 6,
    background: accent ? C.accentDim : 'rgba(255,255,255,0.04)',
    border: `1px solid ${accent ? C.accentBorder : C.border}`,
    color: accent ? C.accent : C.sub,
    fontSize: 12, fontWeight: 500,
    maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  }}>
    {value}
    {onRemove && (
      <button type="button" onClick={onRemove}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          color: 'inherit', opacity: 0.55, lineHeight: 1, display: 'flex', alignItems: 'center' }}
      >
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    )}
  </span>
)

/* ─── Field focus style injection ───────────────────────────────────────── */
const fieldBase = {
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  color: C.text,
  fontSize: 14,
  fontFamily: '"Inter", -apple-system, sans-serif',
  outline: 'none',
  width: '100%',
  padding: '13px 16px',
  transition: 'border-color 0.18s, box-shadow 0.18s',
  lineHeight: 1.5,
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
const UploadPage = () => {
  const navigate = useNavigate()
  const { isGuest, token } = useAuth()

  const [step,       setStep]       = useState(1)
  const [type,       setType]       = useState('game')
  const [mode,       setMode]       = useState('landscape')
  const [title,      setTitle]      = useState('')
  const [category,   setCategory]   = useState(CATEGORY_OPTIONS.game[0])
  const [desc,       setDesc]       = useState('')
  const [tags,       setTags]       = useState([])
  const [tagInput,   setTagInput]   = useState('')
  const [software,   setSoftware]   = useState(['Blender'])
  const [swInput,    setSwInput]    = useState('')
  const [visibility, setVis]        = useState('public')
  const [assets,     setAssets]     = useState([])
  const [cover,      setCover]      = useState(null)
  const [publishing, setPublishing] = useState(false)
  const [published,  setPublished]  = useState(null)
  const [error,      setError]      = useState('')
  const [toast,      setToast]      = useState(null)
  const [focused,    setFocused]    = useState('')

  const cats = CATEGORY_OPTIONS[type] || CATEGORY_OPTIONS.game

  const mainFile = useMemo(() => {
    if (!assets.length) return null
    const files = assets.filter(i => !i.relativePath.toLowerCase().startsWith('cover/'))
    if (type === 'game')
      return files.find(i => isHtmlFile(i.file) && i.file.name.toLowerCase() === 'index.html')
        ?? files.find(i => isHtmlFile(i.file)) ?? files[0] ?? null
    if (type === '3d')
      return files.find(i => isModelFile(i.file) && i.file.name.toLowerCase().endsWith('.glb'))
        ?? files.find(i => isModelFile(i.file)) ?? files[0] ?? null
    return files.find(i => isImageFile(i.file)) ?? files[0] ?? null
  }, [assets, type])

  const mainUrl    = useObjectUrl(mainFile?.file || null)
  const coverUrl   = useObjectUrl(cover?.file || null)
  const previewUrl = coverUrl || mainUrl
  const totalSize  = assets.reduce((s, i) => s + i.file.size, 0) + (cover?.file.size || 0)

  const canNext =
    (step === 1 && !!type) ||
    (step === 2 && assets.length > 0) ||
    (step === 3 && !!title.trim() && !!category.trim()) ||
    step >= 4

  const steps = STEP_LABELS.map((label, i) => ({
    index: i + 1, label,
    status: step > i + 1 ? 'done' : step === i + 1 ? 'active' : 'upcoming',
  }))

  const activeMeta = TYPE_OPTIONS.find(o => o.value === type) || TYPE_OPTIONS[0]

  const selectType = (t) => {
    setType(t)
    setCategory(CATEGORY_OPTIONS[t][0])
    setMode(t === '2d' ? 'portrait' : 'landscape')
  }

  const addTag = () => {
    const v = tagInput.trim().replace(/^#/, '')
    if (v && !tags.includes(v)) setTags(p => [...p, v])
    setTagInput('')
  }

  const addSw = () => {
    const v = swInput.trim()
    if (v && !software.includes(v)) setSoftware(p => [...p, v])
    setSwInput('')
  }

  const handleAssets = (e) => {
    const list = Array.from(e.target.files || [])
    setAssets(list.map(f => ({
      file: f,
      relativePath: (f.webkitRelativePath || f.name).replace(/\\/g, '/'),
    })))
    setError('')
  }

  const handleCover = (e) => {
    const f = e.target.files?.[0]
    if (f) setCover({ file: f, relativePath: `cover/${f.name}` })
  }

  const validate = (s) => {
    if (s === 1 && !type)           { setError('Choose a project type.'); return false }
    if (s === 2 && !assets.length)  { setError('Upload at least one file.'); return false }
    if (s === 3) {
      if (!title.trim())            { setError('Add a project title.'); return false }
      if (!category.trim())         { setError('Pick a category.'); return false }
    }
    setError('')
    return true
  }

  const handleNext = () => {
    if (validate(step)) setStep(p => Math.min(p + 1, 5))
  }

  const handleBack = () => {
    if (step === 1) { navigate('/app/profile'); return }
    setError('')
    setStep(p => Math.max(p - 1, 1))
  }

  const handlePublish = async () => {
    if (isGuest) { setToast({ action: 'publish projects' }); return }
    if (!validate(3) || !assets.length) return
    setPublishing(true)
    try {
      const draft = await createProject(token, {
        title: title.trim(), type, category: category.trim(),
        description: desc.trim(), tags, software, visibility, mode,
      })
      const queue = [...assets]
      if (cover) queue.unshift(cover)
      for (const item of queue) {
        await uploadProjectFile(token, draft.project.id, {
          name: item.file.name, relativePath: item.relativePath,
          mimeType: item.file.type || '',
        }, item.file)
      }
      const res = await publishProject(token, draft.project.id)
      setPublished(res.project)
      setStep(5)
      setError('')
      window.dispatchEvent(new CustomEvent('projectPublished', { detail: res.project }))
    } catch (err) {
      setError(err.message || 'Failed to publish.')
    } finally {
      setPublishing(false)
    }
  }

  const focusStyle = (name) => focused === name
    ? { borderColor: C.accent, boxShadow: '0 0 0 3px rgba(255,122,69,0.12)' } : {}

  /* ── Render ─── */
  return (
    <div
      className="mobile-frame"
      style={{
        position: 'relative', width: '100%', height: '100vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        background: C.bg, color: C.text,
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* Ambient gradient */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 40% at 50% -10%, rgba(255,122,69,0.07) 0%, transparent 70%)',
      }} />

      {/* ── HEADER ── */}
      <div style={{
        position: 'relative', zIndex: 1, flexShrink: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        padding: '28px 22px 0',
        paddingTop: 'calc(env(safe-area-inset-top,0px) + 28px)',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
            New Project
          </h1>
          <p style={{ margin: '5px 0 0', fontSize: 13.5, color: C.sub, lineHeight: 1.4 }}>
            Choose how you'd like to publish your work.
          </p>
        </div>
        <button
          type="button" aria-label="Close"
          onClick={() => navigate('/app/profile')}
          style={{
            width: 34, height: 34, borderRadius: '50%',
            border: `1px solid ${C.border}`,
            background: 'rgba(255,255,255,0.03)',
            color: C.sub, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
            flexShrink: 0, marginLeft: 12,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = C.text }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = C.sub }}
        >
          <CloseIcon size={15} />
        </button>
      </div>

      {/* ── STEPPER ── */}
      <div style={{
        position: 'relative', zIndex: 1, flexShrink: 0,
        display: 'flex', alignItems: 'flex-start',
        padding: '24px 22px 20px',
      }}>
        {/* track line */}
        <div style={{
          position: 'absolute', top: 38, left: 48, right: 48, height: 1,
          background: C.border, zIndex: 0,
        }} />
        {/* progress fill */}
        <div style={{
          position: 'absolute', top: 38, left: 48,
          width: `${((step - 1) / 4) * (100)}%`,
          maxWidth: 'calc(100% - 96px)',
          height: 1, background: C.accent, zIndex: 1,
          transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1)',
        }} />
        {steps.map(s => <StepDot key={s.index} {...s} />)}
      </div>

      {/* ── SCROLL BODY ── */}
      <div style={{
        position: 'relative', zIndex: 1, flex: 1,
        display: 'flex', flexDirection: 'column', minHeight: 0,
      }}>
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '0 16px 0',
          scrollbarWidth: 'none', msOverflowStyle: 'none',
        }}>
          {/* Error banner */}
          {error && (
            <div style={{
              padding: '11px 15px', borderRadius: 10, marginBottom: 16,
              background: 'rgba(255,80,60,0.08)', border: '1px solid rgba(255,80,60,0.2)',
              color: '#FFB8B0', fontSize: 13, lineHeight: 1.5,
            }}>
              {error}
            </div>
          )}

          {/* Main card */}
          <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 20,
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
            overflow: 'hidden',
          }}>

            {step !== 5 ? (
              <>
                {/* Card header */}
                <div style={{ padding: '24px 22px 20px', borderBottom: `1px solid ${C.border}` }}>
                  <h2 style={{ margin: '0 0 5px', fontSize: 19, fontWeight: 600, letterSpacing: '-0.01em' }}>
                    {step === 1 && 'What are you creating?'}
                    {step === 2 && 'Upload your assets'}
                    {step === 3 && 'Project details'}
                    {step === 4 && 'Review & Preview'}
                  </h2>
                  <p style={{ margin: 0, fontSize: 13.5, color: C.sub, lineHeight: 1.5 }}>
                    {step === 1 && 'Select the format that best describes your project.'}
                    {step === 2 && FILE_HINTS[type]}
                    {step === 3 && 'Add metadata so others can find and understand your work.'}
                    {step === 4 && 'Verify everything looks right before publishing.'}
                  </p>
                </div>

                {/* Card body */}
                <div style={{ padding: '22px 22px 26px' }}>

                  {/* ── STEP 1: TYPE SELECTION ── */}
                  {step === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                      {/* Type cards */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {TYPE_OPTIONS.map(opt => {
                          const sel = opt.value === type
                          return (
                            <div
                              key={opt.value}
                              role="button"
                              tabIndex={0}
                              onClick={() => selectType(opt.value)}
                              onKeyDown={e => e.key === 'Enter' && selectType(opt.value)}
                              style={{
                                padding: '15px 18px',
                                borderRadius: 12,
                                border: `1px solid ${sel ? C.accentBorder : C.border}`,
                                background: sel ? C.accentDim : C.card,
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                transition: 'border-color 0.15s, background 0.15s, transform 0.12s',
                                userSelect: 'none',
                              }}
                              onMouseEnter={e => {
                                if (!sel) {
                                  e.currentTarget.style.borderColor = C.borderHover
                                  e.currentTarget.style.background = C.cardHover
                                }
                              }}
                              onMouseLeave={e => {
                                if (!sel) {
                                  e.currentTarget.style.borderColor = C.border
                                  e.currentTarget.style.background = C.card
                                }
                              }}
                              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.985)' }}
                              onMouseUp={e => { e.currentTarget.style.transform = 'none' }}
                            >
                              {/* Left: icon + text */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                {/* Icon box */}
                                <div style={{
                                  width: 46, height: 46, borderRadius: 10, flexShrink: 0,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  background: sel ? 'rgba(255,122,69,0.15)' : 'rgba(255,255,255,0.04)',
                                  border: `1px solid ${sel ? 'rgba(255,122,69,0.3)' : 'rgba(255,255,255,0.06)'}`,
                                  color: sel ? C.accent : C.sub,
                                  transition: 'all 0.15s',
                                }}>
                                  <opt.Icon size={20} color="currentColor" />
                                </div>
                                <div>
                                  <div style={{ fontSize: 15, fontWeight: 500, color: C.text, marginBottom: 2, lineHeight: 1 }}>
                                    {opt.label}
                                  </div>
                                  <div style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.4 }}>
                                    {opt.description}
                                  </div>
                                </div>
                              </div>

                              {/* Right: radio */}
                              <div style={{
                                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                                border: `1.5px solid ${sel ? C.accent : 'rgba(255,255,255,0.15)'}`,
                                background: sel ? C.accent : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.15s',
                              }}>
                                {sel && <CheckIcon size={11} color="#fff" weight="3" />}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Orientation segmented control */}
                      <div>
                        <FormLabel>Orientation</FormLabel>
                        <div style={{
                          position: 'relative', display: 'flex',
                          background: C.card, border: `1px solid ${C.border}`,
                          borderRadius: 10, padding: 3, height: 42,
                        }}>
                          {/* Sliding thumb */}
                          <div style={{
                            position: 'absolute',
                            top: 3, bottom: 3,
                            left: mode === 'portrait' ? 3 : 'calc(50% + 1.5px)',
                            width: 'calc(50% - 4.5px)',
                            background: C.bg,
                            border: `1px solid rgba(255,255,255,0.1)`,
                            borderRadius: 7,
                            zIndex: 1,
                            transition: 'left 0.22s cubic-bezier(0.4,0,0.2,1)',
                            pointerEvents: 'none',
                          }} />
                          {['portrait', 'landscape'].map(v => (
                            <button
                              key={v} type="button"
                              onClick={() => setMode(v)}
                              style={{
                                flex: 1, border: 'none', background: 'transparent',
                                color: mode === v ? C.text : C.muted,
                                fontSize: 13, fontWeight: mode === v ? 500 : 400,
                                cursor: 'pointer', zIndex: 2, position: 'relative',
                                transition: 'color 0.2s',
                              }}
                            >
                              {v === 'portrait' ? 'Portrait' : 'Landscape'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── STEP 2: ASSETS ── */}
                  {step === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                      {/* Main files upload zone */}
                      <div style={{
                        borderRadius: 12,
                        border: `1px solid ${C.border}`,
                        background: C.card,
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          padding: '16px 18px',
                          borderBottom: `1px solid ${C.border}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                        }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 2 }}>
                              Main assets
                            </div>
                            <div style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.4 }}>
                              {type === 'game' ? 'Build folder with index.html' : type === '3d' ? '.glb / .gltf + textures' : 'Primary image file'}
                            </div>
                          </div>
                          <label style={{
                            padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
                            background: 'rgba(255,122,69,0.1)', border: `1px solid ${C.accentBorder}`,
                            color: C.accent, fontSize: 12.5, fontWeight: 500,
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.15s',
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,122,69,0.18)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,122,69,0.1)'}
                          >
                            <UploadCloudIcon size={15} color="currentColor" />
                            Choose Files
                            <input
                              type="file" style={{ display: 'none' }}
                              multiple
                              accept={
                                type === 'game' ? '.html,.htm,.js,.json,.wasm,.data,.css,.png,.jpg,.jpeg,.webp,.mp3,.ogg'
                                : type === '3d'  ? '.glb,.gltf,.bin,.png,.jpg,.jpeg,.webp'
                                : '.png,.jpg,.jpeg,.webp,.gif,.avif'
                              }
                              {...(type === 'game' ? { webkitdirectory: '', directory: '' } : {})}
                              onChange={handleAssets}
                            />
                          </label>
                        </div>

                        {/* File list */}
                        <div style={{ padding: '14px 18px', minHeight: 52 }}>
                          {assets.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {assets.map(item => (
                                <Tag
                                  key={item.relativePath}
                                  value={`${item.relativePath} (${formatBytes(item.file.size)})`}
                                  onRemove={() => setAssets(p => p.filter(i => i.relativePath !== item.relativePath))}
                                  accent={item === mainFile}
                                />
                              ))}
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '18px 0', gap: 8 }}>
                              <UploadCloudIcon size={26} color={C.muted} />
                              <span style={{ fontSize: 13, color: C.muted }}>No files selected yet</span>
                            </div>
                          )}
                        </div>

                        {/* File stats footer */}
                        <div style={{
                          padding: '10px 18px',
                          borderTop: `1px solid ${C.border}`,
                          display: 'flex', justifyContent: 'space-between',
                          fontSize: 12, color: C.sub,
                        }}>
                          <span>{assets.length} file{assets.length !== 1 ? 's' : ''} selected</span>
                          <span>Total: {formatBytes(totalSize)}</span>
                        </div>
                      </div>

                      {/* Cover image upload */}
                      <div style={{
                        borderRadius: 12,
                        border: `1px solid ${C.border}`,
                        background: C.card,
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          padding: '16px 18px',
                          borderBottom: `1px solid ${C.border}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                        }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 2 }}>
                              Cover thumbnail
                            </div>
                            <div style={{ fontSize: 12.5, color: C.sub }}>
                              Optional — recommended for games and 3D.
                            </div>
                          </div>
                          <label style={{
                            padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
                            background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
                            color: C.sub, fontSize: 12.5, fontWeight: 500,
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.15s',
                          }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = C.text }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = C.sub }}
                          >
                            <ImagePlusIcon size={15} color="currentColor" />
                            Choose Cover
                            <input
                              type="file" style={{ display: 'none' }}
                              accept=".png,.jpg,.jpeg,.webp,.gif,.avif"
                              onChange={handleCover}
                            />
                          </label>
                        </div>
                        <div style={{ padding: '14px 18px' }}>
                          {cover ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                              <Tag value={`${cover.relativePath} (${formatBytes(cover.file.size)})`} accent />
                              <button
                                type="button" onClick={() => setCover(null)}
                                style={{
                                  background: 'none', border: 'none', cursor: 'pointer',
                                  color: C.muted, fontSize: 12, padding: 0, transition: 'color 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = C.text}
                                onMouseLeave={e => e.currentTarget.style.color = C.muted}
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0', gap: 6 }}>
                              <ImagePlusIcon size={24} color={C.muted} />
                              <span style={{ fontSize: 13, color: C.muted }}>No cover selected</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── STEP 3: PROJECT INFO ── */}
                  {step === 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

                      {/* Title */}
                      <div>
                        <FormLabel>Project Title *</FormLabel>
                        <input
                          type="text"
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                          placeholder="e.g. Neon Cube Composition"
                          style={{ ...fieldBase, ...focusStyle('title') }}
                          onFocus={() => setFocused('title')}
                          onBlur={() => setFocused('')}
                        />
                      </div>

                      {/* Category + Visibility side by side */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <FormLabel>Category *</FormLabel>
                          <div style={{ position: 'relative' }}>
                            <select
                              value={category}
                              onChange={e => setCategory(e.target.value)}
                              style={{
                                ...fieldBase, ...focusStyle('cat'),
                                appearance: 'none', WebkitAppearance: 'none',
                                paddingRight: 38, cursor: 'pointer',
                              }}
                              onFocus={() => setFocused('cat')}
                              onBlur={() => setFocused('')}
                            >
                              {cats.map(c => (
                                <option key={c} value={c} style={{ background: '#1A2030' }}>{c}</option>
                              ))}
                            </select>
                            <div style={{
                              position: 'absolute', top: '50%', right: 12,
                              transform: 'translateY(-50%)', pointerEvents: 'none',
                              color: C.sub, display: 'flex',
                            }}>
                              <ChevronDownIcon size={15} />
                            </div>
                          </div>
                        </div>

                        <div>
                          <FormLabel>Visibility</FormLabel>
                          <div style={{ display: 'flex', height: 47, gap: 0, borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                            {[
                              { value: 'public',  label: 'Public',  Icon: GlobeIcon2 },
                              { value: 'private', label: 'Private', Icon: LockIcon2 },
                            ].map(({ value, label, Icon }) => {
                              const sel = visibility === value
                              return (
                                <button
                                  key={value} type="button"
                                  onClick={() => setVis(value)}
                                  style={{
                                    flex: 1, border: 'none',
                                    background: sel ? C.accentDim : C.card,
                                    color: sel ? C.accent : C.sub,
                                    fontSize: 12.5, fontWeight: sel ? 500 : 400,
                                    cursor: 'pointer', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', gap: 5,
                                    transition: 'all 0.15s',
                                    borderRight: value === 'public' ? `1px solid ${C.border}` : 'none',
                                  }}
                                >
                                  <Icon size={13} color="currentColor" />
                                  {label}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <FormLabel>Description</FormLabel>
                        <textarea
                          value={desc}
                          onChange={e => setDesc(e.target.value)}
                          rows={4}
                          placeholder="Describe the concept, tools, and experience behind this project."
                          style={{
                            ...fieldBase, ...focusStyle('desc'),
                            minHeight: 110, resize: 'none',
                          }}
                          onFocus={() => setFocused('desc')}
                          onBlur={() => setFocused('')}
                        />
                      </div>

                      {/* Tags */}
                      <div>
                        <FormLabel>Tags</FormLabel>
                        {tags.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                            {tags.map(t => (
                              <Tag key={t} value={`#${t}`} accent
                                onRemove={() => setTags(p => p.filter(x => x !== t))} />
                            ))}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            type="text" value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() } }}
                            placeholder="Type and press Enter"
                            style={{ ...fieldBase, ...focusStyle('tag'), flex: 1, minHeight: 44, padding: '10px 14px' }}
                            onFocus={() => setFocused('tag')}
                            onBlur={() => setFocused('')}
                          />
                          <button type="button" onClick={addTag} style={{
                            padding: '0 16px', height: 44, borderRadius: 10,
                            background: C.accentDim, border: `1px solid ${C.accentBorder}`,
                            color: C.accent, fontWeight: 500, fontSize: 13.5,
                            cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,122,69,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = C.accentDim}
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Software */}
                      <div>
                        <FormLabel>Software Used</FormLabel>
                        {software.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                            {software.map(s => (
                              <Tag key={s} value={s}
                                onRemove={() => setSoftware(p => p.filter(x => x !== s))} />
                            ))}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            type="text" list="sw-list" value={swInput}
                            onChange={e => setSwInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSw() } }}
                            placeholder="Blender, Unity, Maya…"
                            style={{ ...fieldBase, ...focusStyle('sw'), flex: 1, minHeight: 44, padding: '10px 14px' }}
                            onFocus={() => setFocused('sw')}
                            onBlur={() => setFocused('')}
                          />
                          <button type="button" onClick={addSw} style={{
                            padding: '0 16px', height: 44, borderRadius: 10,
                            background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
                            color: C.sub, fontWeight: 500, fontSize: 13.5,
                            cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
                          }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = C.text }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = C.sub }}
                          >
                            Add
                          </button>
                        </div>
                        <datalist id="sw-list">
                          {SOFTWARE_SUGGESTIONS.map(s => <option key={s} value={s} />)}
                        </datalist>
                      </div>

                    </div>
                  )}

                  {/* ── STEP 4: PREVIEW ── */}
                  {step === 4 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                      {/* Preview area */}
                      <div style={{
                        borderRadius: 12, overflow: 'hidden',
                        border: `1px solid ${C.border}`,
                        background: '#0F131A',
                      }}>
                        {type === '3d' && mainFile?.file && mainUrl ? (
                          <GltfAssetViewer modelUrl={mainUrl} title={title || '3D Preview'} mode={mode} background="#0F131A" />
                        ) : type === '2d' && previewUrl ? (
                          <img src={previewUrl} alt="Preview"
                            style={{ width: '100%', aspectRatio: mode === 'portrait' ? '3/4' : '16/10', objectFit: 'cover', display: 'block' }} />
                        ) : (
                          <div style={{
                            minHeight: 160, padding: 22,
                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 14,
                            background: 'linear-gradient(160deg, rgba(255,122,69,0.07) 0%, transparent 60%)',
                          }}>
                            <div>
                              <div style={{ fontSize: 10.5, fontWeight: 600, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                                WebGL Bundle
                              </div>
                              <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>
                                {title || 'Untitled Game'}
                              </h3>
                              <p style={{ margin: 0, fontSize: 13, color: C.sub, lineHeight: 1.5 }}>
                                Runs interactively in the web feed after publishing.
                              </p>
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {mainFile && <Tag value={`Entry: ${mainFile.relativePath}`} accent />}
                              <Tag value={`${assets.length} file${assets.length !== 1 ? 's' : ''}`} />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Meta grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {[
                          { label: 'Type',       value: activeMeta.label },
                          { label: 'Visibility', value: visibility === 'public' ? 'Public' : 'Private' },
                          { label: 'Files',      value: `${assets.length} files` },
                          { label: 'Total Size', value: formatBytes(totalSize) },
                        ].map(({ label, value }) => (
                          <div key={label} style={{
                            padding: '13px 15px', borderRadius: 10,
                            background: C.card, border: `1px solid ${C.border}`,
                          }}>
                            <div style={{ fontSize: 10.5, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>
                              {label}
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Summary row */}
                      {(title || category) && (
                        <div style={{
                          padding: '13px 15px', borderRadius: 10,
                          background: C.card, border: `1px solid ${C.border}`,
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                          <div>
                            <div style={{ fontSize: 14.5, fontWeight: 500, color: C.text, marginBottom: 2 }}>{title}</div>
                            <div style={{ fontSize: 12.5, color: C.sub }}>{category} · {mode}</div>
                          </div>
                          {tags.length > 0 && (
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                              {tags.slice(0, 2).map(t => <Tag key={t} value={`#${t}`} accent />)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </>

            ) : (
              /* ── STEP 5: SUCCESS ── */
              <div style={{
                padding: '40px 24px 36px',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                textAlign: 'center', gap: 20,
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: C.successDim,
                  border: `1px solid ${C.success}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CheckIcon size={26} color={C.success} weight="2.5" />
                </div>
                <div>
                  <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>
                    Project published!
                  </h2>
                  <p style={{ margin: 0, fontSize: 14, color: C.sub, lineHeight: 1.55 }}>
                    Your project is live in the feed and ready to be viewed or played.
                  </p>
                </div>
                <div style={{
                  width: '100%', padding: '15px 18px', borderRadius: 12,
                  border: `1px solid ${C.border}`, background: C.card, textAlign: 'left',
                }}>
                  <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                    Published
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: C.text, marginBottom: 3 }}>
                    {published?.title || title}
                  </div>
                  <div style={{ fontSize: 13, color: C.accent, textTransform: 'capitalize' }}>
                    {published?.type || type}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Spacer so footer doesn't cover content */}
          <div style={{ height: 100 }} />
        </div>

        {/* ── STICKY FOOTER ── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2,
          padding: '14px 16px calc(env(safe-area-inset-bottom,0px) + 18px)',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(13,17,23,0.97) 30%, #0D1117 100%)',
        }}>
          <div style={{ display: 'flex', gap: 10 }}>

            {/* Back button */}
            <button type="button" onClick={handleBack}
              style={{
                flex: 1, height: 50, borderRadius: 16,
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${C.border}`,
                color: C.sub, cursor: 'pointer',
                fontWeight: 500, fontSize: 14,
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = C.text }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = C.sub }}
            >
              Back
            </button>

            {/* Primary action button */}
            {step < 4 && (
              <button type="button" onClick={handleNext} disabled={!canNext}
                style={{
                  flex: 1.6, height: 50, borderRadius: 16,
                  background: canNext ? C.accent : 'rgba(255,122,69,0.25)',
                  border: 'none', color: canNext ? '#fff' : 'rgba(255,255,255,0.35)',
                  fontWeight: 600, fontSize: 14,
                  fontFamily: 'inherit',
                  cursor: canNext ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.15s',
                  letterSpacing: '-0.01em',
                }}
                onMouseEnter={e => { if (canNext) e.currentTarget.style.filter = 'brightness(1.08)' }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
                onMouseDown={e => { if (canNext) e.currentTarget.style.transform = 'scale(0.97)' }}
                onMouseUp={e => { e.currentTarget.style.transform = 'none' }}
              >
                Continue <ArrowRightIcon size={16} />
              </button>
            )}

            {step === 4 && (
              <button type="button" onClick={handlePublish} disabled={publishing}
                style={{
                  flex: 1.6, height: 50, borderRadius: 16,
                  background: publishing ? 'rgba(255,122,69,0.4)' : C.accent,
                  border: 'none', color: '#fff',
                  fontWeight: 600, fontSize: 14,
                  fontFamily: 'inherit',
                  cursor: publishing ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.15s',
                  letterSpacing: '-0.01em',
                }}
                onMouseEnter={e => { if (!publishing) e.currentTarget.style.filter = 'brightness(1.08)' }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
              >
                {publishing ? 'Publishing…' : 'Publish Project'}
                {!publishing && <ArrowRightIcon size={16} />}
              </button>
            )}

            {step === 5 && (
              <button type="button" onClick={() => navigate('/app/home')}
                style={{
                  flex: 1.6, height: 50, borderRadius: 16,
                  background: C.accent, border: 'none', color: '#fff',
                  fontWeight: 600, fontSize: 14,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.08)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'none'}
              >
                Go to Feed <ArrowRightIcon size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'absolute', bottom: 110, left: '50%', transform: 'translateX(-50%)',
          background: '#1A2030', border: `1px solid ${C.border}`,
          color: C.text, padding: '12px 18px', borderRadius: 100,
          fontSize: 13, fontWeight: 500, zIndex: 1100,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap',
        }}>
          Sign in to {toast.action}.
          <button type="button" onClick={() => navigate('/signin')} style={{
            border: 'none', background: C.accent, color: '#fff',
            fontWeight: 600, borderRadius: 999, padding: '5px 12px',
            cursor: 'pointer', fontSize: 12.5,
          }}>
            Sign In
          </button>
        </div>
      )}
    </div>
  )
}

export default UploadPage
