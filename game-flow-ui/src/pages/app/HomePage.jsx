import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import WebGLGamePlayer from '../../components/WebGLGamePlayer'
import GltfAssetViewer from '../../components/GltfAssetViewer'
import wavingVideo from '../../assets/wave.mp4'
import logoImg from '../../assets/logo.jpg'
import { fetchContent, updateContentEngagement } from '../../lib/content'
import {
  PlusIcon,
  HeartIcon,
  CommentIcon,
  BookmarkIcon,
  ShareIcon,
  VerifiedIcon,
  CloseIcon,
} from '../../components/icons/Icons'
import './HomePage.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

const DEFAULT_AVATAR =
  'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/19f781f2a-1e76-4c62-8f73-55c5248d45ab.png'

const LIVE_CREATOR_POOL = [
  { creatorName: 'studio_alpha', discipline: 'Game Developer' },
  { creatorName: 'mesh_room', discipline: '3D Asset Artist' },
  { creatorName: 'render_forge', discipline: 'Technical Artist' },
  { creatorName: 'arcade_lab', discipline: 'Game Studio' },
]

function buildEngagement(counts = {}) {
  return {
    likesCount: counts.likesCount ?? 0,
    commentsCount: counts.commentsCount ?? 0,
    savesCount: counts.savesCount ?? 0,
    sharesCount: counts.sharesCount ?? 0,
    viewerHasLiked: false,
    viewerHasSaved: false,
    comments: Array.isArray(counts.comments) ? counts.comments : [],
  }
}

const DEMO_REELS = [
  {
    id: 'demo-video',
    feedKey: 'demo-video',
    contentType: 'demo',
    contentId: 'demo-video',
    creatorName: 'alex_vfx',
    discipline: 'VFX Artist',
    avatar: DEFAULT_AVATAR,
    video: wavingVideo,
    engagement: buildEngagement({ likesCount: 12400, commentsCount: 843, savesCount: 2100 }),
    projectTitle: 'Volumetric Portal Effect',
    description:
      'Real-time volumetric portal simulation in Unreal Engine 5.2. Testing Niagara fluids combined with custom HLSL raymarching shaders for deep cinematic layering.',
    software: ['Unreal Engine', 'Houdini', 'Nuke'],
    tags: ['#vfx', '#ue5', '#realtime', '#simulation'],
    sourceLabel: 'Local demo content',
  },
  {
    id: 'demo-game-1',
    feedKey: 'demo-game-1',
    contentType: 'demo',
    contentId: 'demo-game-1',
    creatorName: 'flappy_dev',
    discipline: 'Game Developer',
    avatar: DEFAULT_AVATAR,
    type: 'game',
    gameUrl: '/games/Flappy Bird/Build/index.html',
    mode: 'portrait',
    thumbnailMode: 'portrait',
    engagement: buildEngagement({ likesCount: 15400, commentsCount: 943, savesCount: 3100 }),
    projectTitle: 'Flappy Bird Clone',
    description: 'Recreation of the classic Flappy Bird game using Unity WebGL.',
    software: ['Unity', 'C#'],
    tags: ['#game', '#webgl', '#unity'],
    loadingScreenUrl: '/games/Flappy Bird/loading_screen.png',
    sourceLabel: 'Local demo content',
  },
  {
    id: 'demo-asset-1',
    feedKey: 'demo-asset-1',
    contentType: 'demo',
    contentId: 'demo-asset-1',
    creatorName: 'prop_master',
    discipline: '3D Modeler',
    avatar: DEFAULT_AVATAR,
    type: '3d',
    modelUrl: '/3dAssets/hammer.glb',
    mode: 'portrait',
    engagement: buildEngagement({ likesCount: 6800, commentsCount: 312, savesCount: 1200 }),
    projectTitle: 'Thor Hammer Prop',
    description: 'A highly detailed 3D model of a hammer. Viewable directly in the browser.',
    software: ['Blender', 'Substance Painter'],
    tags: ['#3d', '#props', '#modeling'],
    sourceLabel: 'Local demo content',
  },
  {
    id: 'demo-asset-2',
    feedKey: 'demo-asset-2',
    contentType: 'demo',
    contentId: 'demo-asset-2',
    creatorName: 'avik_art',
    discipline: '3D Asset Artist',
    avatar: DEFAULT_AVATAR,
    type: '3d',
    modelUrl: '/3dAssets/Avik model file 1/Avik model file/Model/Shoe Model.glb',
    textures: {
      map: '/3dAssets/Avik model file 1/Avik model file/Texture/Uv unfold fbx_standardSurface2_BaseColor.1001.png',
      normalMap:
        '/3dAssets/Avik model file 1/Avik model file/Texture/Uv unfold fbx_standardSurface2_Normal.1001.png',
      roughnessMap:
        '/3dAssets/Avik model file 1/Avik model file/Texture/Uv unfold fbx_standardSurface2_Roughness.1001.png',
      metalnessMap:
        '/3dAssets/Avik model file 1/Avik model file/Texture/Uv unfold fbx_standardSurface2_Metallic.1001.png',
      emissiveMap:
        '/3dAssets/Avik model file 1/Avik model file/Texture/Uv unfold fbx_standardSurface2_Emissive.1001.png',
    },
    mode: 'portrait',
    engagement: buildEngagement({ likesCount: 9800, commentsCount: 432, savesCount: 1780 }),
    projectTitle: 'Avik Athletic Shoe',
    description:
      'A beautifully styled athletic shoe designed with complex fabric weave maps, normal displacements, and rubberized sole textures.',
    software: ['Maya', 'Substance Painter', 'ZBrush'],
    tags: ['#3d', '#shoe', '#modeling', '#texturing'],
    sourceLabel: 'Local demo content',
  },
  {
    id: 'demo-game-2',
    feedKey: 'demo-game-2',
    contentType: 'demo',
    contentId: 'demo-game-2',
    creatorName: 'money_maker',
    discipline: 'Game Studio',
    avatar: DEFAULT_AVATAR,
    type: 'game',
    gameUrl: '/games/Money Ladder/index.html',
    mode: 'landscape',
    thumbnailMode: 'portrait',
    engagement: buildEngagement({ likesCount: 8900, commentsCount: 450, savesCount: 2200 }),
    projectTitle: 'Money Ladder WebGL',
    description: 'An interactive web-based game. Climb the ladder to success!',
    software: ['Unity', 'WebGL'],
    tags: ['#webgl', '#game', '#interactive'],
    loadingScreenUrl: '/games/Money Ladder/loading_screen.png',
    sourceLabel: 'Local demo content',
  },
  {
    id: 'demo-image',
    feedKey: 'demo-image',
    contentType: 'demo',
    contentId: 'demo-image',
    creatorName: 'zara_neon',
    discipline: 'Senior Animator',
    avatar: DEFAULT_AVATAR,
    image:
      'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/12de9432e-ccf4-418f-a563-5181abb44ff3.png',
    engagement: buildEngagement({ likesCount: 9800, commentsCount: 412, savesCount: 1500 }),
    projectTitle: 'Cyberpunk Rigging Loop',
    description:
      'Rigging and character animation tests for a cyberpunk game project. Fully optimized for high-refresh mobile game engines.',
    software: ['Blender', 'Substance Painter', 'Maya'],
    tags: ['#3d', '#animation', '#cyberpunk', '#blender'],
    sourceLabel: 'Local demo content',
  },
]

function pickCreator(index) {
  return LIVE_CREATOR_POOL[index % LIVE_CREATOR_POOL.length]
}

function formatCount(value) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`
  }

  return String(value)
}

function getEngagement(item) {
  const engagement = item?.engagement ?? {}

  return {
    likesCount: engagement.likesCount ?? item.likesCount ?? 0,
    commentsCount: engagement.commentsCount ?? item.commentsCount ?? 0,
    savesCount: engagement.savesCount ?? item.savesCount ?? 0,
    sharesCount: engagement.sharesCount ?? item.sharesCount ?? 0,
    viewerHasLiked: Boolean(engagement.viewerHasLiked),
    viewerHasSaved: Boolean(engagement.viewerHasSaved),
    comments: Array.isArray(engagement.comments) ? engagement.comments : [],
  }
}

function mapGameToReel(game, index) {
  const creator = pickCreator(index)
  const engagement = getEngagement(game)

  return {
    id: game.id ?? `game:${game.slug ?? index}`,
    contentType: game.contentType ?? 'game',
    contentId: game.contentId ?? game.slug ?? String(index),
    creatorName: creator.creatorName,
    discipline: creator.discipline,
    avatar: DEFAULT_AVATAR,
    type: 'game',
    gameUrl: game.gameUrl,
    loadingScreenUrl: game.loadingScreenUrl,
    mode: game.mode ?? 'landscape',
    thumbnailMode: game.mode ?? 'landscape',
    engagement,
    projectTitle: game.title ?? 'Untitled game',
    description: game.description ?? '',
    software: ['Unity', 'WebGL'],
    tags: ['#game', '#webgl', game.mode === 'portrait' ? '#mobile' : '#desktop'],
    sourceLabel: 'Live from backend',
  }
}

function mapAssetToReel(asset, index) {
  const creator = pickCreator(index + 1)
  const engagement = getEngagement(asset)

  return {
    id: asset.id ?? `asset:${asset.slug ?? index}`,
    contentType: asset.contentType ?? 'asset',
    contentId: asset.contentId ?? asset.slug ?? String(index),
    creatorName: creator.creatorName,
    discipline: creator.discipline,
    avatar: DEFAULT_AVATAR,
    type: '3d',
    modelUrl: asset.modelUrl,
    mode: asset.mode ?? 'landscape',
    background: asset.background ?? '#101820',
    engagement,
    projectTitle: asset.title ?? 'Untitled asset',
    description: asset.description ?? '',
    software: ['Blender', 'Three.js'],
    tags: ['#3d', '#glb', asset.mode === 'portrait' ? '#mobile' : '#desktop'],
    sourceLabel: 'Live from backend',
  }
}

function mapProjectToReel(project, index) {
  const creatorName = project.ownerUsername || project.ownerName || `creator_${index + 1}`
  const discipline =
    project.type === 'game'
      ? 'Game Developer'
      : project.type === '3d'
        ? '3D Artist'
        : '2D Artist'
  const engagement = getEngagement(project)

  return {
    id: project.id ?? `project:${project.contentId ?? index}`,
    contentType: project.contentType ?? 'project',
    contentId: project.contentId ?? project.id ?? String(index),
    projectId: project.contentId ?? project.id,
    creatorName,
    discipline,
    avatar: project.ownerAvatar || DEFAULT_AVATAR,
    type: project.type === '2d' ? 'image' : project.type,
    gameUrl: project.gameUrl,
    modelUrl: project.modelUrl,
    image: project.imageUrl,
    loadingScreenUrl: project.previewUrl,
    mode: project.mode ?? 'landscape',
    thumbnailMode: project.mode ?? 'landscape',
    background: '#101820',
    engagement,
    projectTitle: project.title ?? 'Untitled project',
    description: project.description ?? '',
    software: Array.isArray(project.software) ? project.software : [],
    tags: Array.isArray(project.tags) ? project.tags : [],
    sourceLabel: 'Uploaded project',
  }
}

function normalizeBackendContent(data) {
  const games = Array.isArray(data?.games) ? data.games : []
  const assets = Array.isArray(data?.assets) ? data.assets : []
  const projects = Array.isArray(data?.projects) ? data.projects : []

  return [...games.map(mapGameToReel), ...assets.map(mapAssetToReel), ...projects.map(mapProjectToReel)]
}

const initialFeedState = {
  status: 'loading',
  error: '',
  sourceLabel: 'Connecting to backend',
  items: DEMO_REELS,
}

function HomePage() {
  const navigate = useNavigate()
  const { isGuest, user, token } = useAuth()
  const [feedState, setFeedState] = useState(initialFeedState)
  const [activeIdx, setActiveIdx] = useState(0)
  const [expandedProj, setExpandedProj] = useState(null)
  const [commentTarget, setCommentTarget] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const feedContainerRef = useRef(null)

  const loadContent = useCallback(async (signal) => {
    try {
      const data = await fetchContent(token, { signal })
      const backendItems = normalizeBackendContent(data)

      const items = backendItems.length ? backendItems : DEMO_REELS.map((item) => ({
        ...item,
        engagement: getEngagement(item),
      }))

      setFeedState({
        status: 'ready',
        error: '',
        sourceLabel: 'Live backend content',
        items,
      })
      setActiveIdx(0)
      setExpandedProj(null)
      setCommentTarget(null)
    } catch (error) {
      if (error?.name === 'AbortError') {
        return
      }

      setFeedState({
        status: 'fallback',
        error: 'Unable to reach the backend. Showing local demo content for now.',
        sourceLabel: 'Local demo content',
        items: DEMO_REELS,
      })
      setActiveIdx(0)
      setExpandedProj(null)
      setCommentTarget(null)
    }
  }, [token])

  useEffect(() => {
    const controller = new AbortController()
    loadContent(controller.signal)

    const handleProjectPublished = () => {
      loadContent()
    }

    window.addEventListener('projectPublished', handleProjectPublished)

    return () => {
      controller.abort()
      window.removeEventListener('projectPublished', handleProjectPublished)
    }
  }, [loadContent])

  const handleScroll = () => {
    if (!feedContainerRef.current) {
      return
    }

    const scrollPos = feedContainerRef.current.scrollTop
    const cardHeight = feedContainerRef.current.clientHeight
    const nextIdx = Math.round(scrollPos / cardHeight)

    if (
      nextIdx !== activeIdx &&
      nextIdx >= 0 &&
      nextIdx < feedState.items.length
    ) {
      setActiveIdx(nextIdx)
      setExpandedProj(null)
    }
  }

  const updateItemInState = (targetId, updater) => {
    setFeedState((prev) => ({
      ...prev,
      items: prev.items.map((item) => (getReelKey(item) === targetId ? updater(item) : item)),
    }))

    setExpandedProj((prev) => {
      if (!prev || getReelKey(prev) !== targetId) {
        return prev
      }

      return updater(prev)
    })
  }

  const getReelKey = (reel) => reel.feedKey ?? reel.id

  const getCounts = (reel) => {
    const engagement = reel.engagement ?? {}

    return {
      likesCount: engagement.likesCount ?? 0,
      commentsCount: engagement.commentsCount ?? 0,
      savesCount: engagement.savesCount ?? 0,
      sharesCount: engagement.sharesCount ?? 0,
      viewerHasLiked: Boolean(engagement.viewerHasLiked),
      viewerHasSaved: Boolean(engagement.viewerHasSaved),
      comments: Array.isArray(engagement.comments) ? engagement.comments : [],
    }
  }

  const applyLocalEngagement = (reel, action, extra = {}) => {
    const current = getCounts(reel)
    const next = { ...current }

    if (action === 'react') {
      next.viewerHasLiked = !current.viewerHasLiked
      next.likesCount = Math.max(0, current.likesCount + (current.viewerHasLiked ? -1 : 1))
    }

    if (action === 'save') {
      next.viewerHasSaved = !current.viewerHasSaved
      next.savesCount = Math.max(0, current.savesCount + (current.viewerHasSaved ? -1 : 1))
    }

    if (action === 'comment' && extra.comment) {
      next.commentsCount = current.commentsCount + 1
      next.comments = [extra.comment, ...current.comments]
    }

    if (action === 'share') {
      next.sharesCount = current.sharesCount + 1
    }

    return {
      ...reel,
      engagement: next,
    }
  }

  const syncEngagement = (updatedContent) => {
    const targetId = updatedContent?.feedKey ?? updatedContent?.id

    if (!targetId) {
      return
    }

    updateItemInState(targetId, (item) => ({
      ...item,
      ...updatedContent,
      engagement: {
        ...(item.engagement ?? {}),
        ...(updatedContent.engagement ?? {}),
      },
    }))
  }

  const mutateEngagement = async (reel, action, payload = {}) => {
    const targetId = getReelKey(reel)
    const isBackendPost = reel.contentType && reel.contentType !== 'demo'

    if (isGuest && isBackendPost) {
      setExpandedProj(reel)
      return
    }

    if (!isBackendPost) {
      const localComment =
        action === 'comment'
          ? {
              commentId: `local-${Date.now()}`,
              userId: user?.id || 'local',
              username: user?.username || 'guest',
              name: user?.name || 'Guest',
              avatar: user?.avatar || DEFAULT_AVATAR,
              text: payload.commentText || '',
              createdAt: new Date().toISOString(),
            }
          : null

      updateItemInState(targetId, (item) =>
        applyLocalEngagement(item, action, { comment: localComment }),
      )
      return
    }

    const result = await updateContentEngagement(token, reel.contentType, reel.contentId, {
      action,
      ...payload,
    })

    syncEngagement(result.content)
  }

  const handleLike = async (reel) => {
    if (isGuest) {
      window.alert('Sign in to react to posts.')
      return
    }

    await mutateEngagement(reel, 'react')
  }

  const handleSave = async (reel) => {
    if (isGuest) {
      window.alert('Sign in to save posts.')
      return
    }

    await mutateEngagement(reel, 'save')
  }

  const handleShare = async (reel) => {
    const shareUrl =
      reel.contentType === 'project'
        ? `${window.location.origin}/app/project/${reel.contentId || reel.projectId || reel.id}`
        : window.location.href

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
      }
    } catch {
      window.prompt('Copy this link', shareUrl)
    }

    if (!isGuest && reel.contentType && reel.contentType !== 'demo') {
      await mutateEngagement(reel, 'share')
    } else if (reel.contentType === 'demo') {
      updateItemInState(getReelKey(reel), (item) => applyLocalEngagement(item, 'share'))
    }
  }

  const openComments = (reel) => {
    if (isGuest && reel.contentType !== 'demo') {
      window.alert('Sign in to comment on posts.')
      return
    }

    setCommentTarget(reel)
    setCommentText('')
  }

  const submitComment = async (event) => {
    event.preventDefault()

    if (!commentTarget || !commentText.trim()) {
      return
    }

    setIsSubmittingComment(true)

    try {
      if (commentTarget.contentType === 'demo') {
        const localComment = {
          commentId: `local-${Date.now()}`,
          userId: user?.id || 'local',
          username: user?.username || 'guest',
          name: user?.name || 'Guest',
          avatar: user?.avatar || DEFAULT_AVATAR,
          text: commentText.trim(),
          createdAt: new Date().toISOString(),
        }

        updateItemInState(commentTarget.id, (item) =>
          applyLocalEngagement(item, 'comment', { comment: localComment }),
        )
      } else {
        const result = await updateContentEngagement(token, commentTarget.contentType, commentTarget.contentId, {
          action: 'comment',
          commentText: commentText.trim(),
        })

        syncEngagement(result.content)
      }

      setCommentText('')
      setCommentTarget(null)
    } catch (error) {
      window.alert(error.message || 'Failed to add comment.')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const safeActiveIdx = Math.min(
    activeIdx,
    Math.max(feedState.items.length - 1, 0),
  )

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="logo-container">
          <img src={logoImg} alt="CreativeVerse" className="logo-img" />
          <span className="logo-text">CreativeVerse</span>
        </div>

        <button
          onClick={() => navigate('/app/explore')}
          className="search-btn"
          aria-label="Search"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </header>

      {feedState.status !== 'ready' ? (
        <div
          style={{
            position: 'absolute',
            top: 72,
            left: 16,
            right: 16,
            zIndex: 20,
            padding: '10px 14px',
            borderRadius: 14,
            background:
              feedState.status === 'fallback'
                ? 'rgba(255, 122, 89, 0.16)'
                : 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: 600,
            backdropFilter: 'blur(12px)',
          }}
        >
          {feedState.error || 'Connecting to the backend...'}
        </div>
      ) : null}

      <div ref={feedContainerRef} onScroll={handleScroll} className="reels-container">
        {feedState.items.map((reel, index) => {
          const engagement = getCounts(reel)
          const isLiked = engagement.viewerHasLiked
          const isSaved = engagement.viewerHasSaved

          const isCurrentUserReel = user && (reel.creatorName === user.username);
          const displayAvatar = isCurrentUserReel && user.avatar ? user.avatar : reel.avatar;
          const displayCreatorName = isCurrentUserReel ? user.username : reel.creatorName;

          return (
            <div key={reel.id} className="reel-card">
              {reel.type === 'game' ? (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    pointerEvents: index === safeActiveIdx ? 'auto' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <WebGLGamePlayer
                    gameUrl={reel.gameUrl}
                    title={reel.projectTitle}
                    mode={reel.mode}
                    thumbnailMode={reel.thumbnailMode}
                    aspectRatio={reel.aspectRatio}
                    loadingScreenUrl={reel.loadingScreenUrl}
                    isActive={index === safeActiveIdx}
                  />
                </div>
              ) : reel.type === '3d' ? (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    pointerEvents: index === safeActiveIdx ? 'auto' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <GltfAssetViewer
                    modelUrl={reel.modelUrl}
                    title={reel.projectTitle}
                    mode={reel.mode ?? 'portrait'}
                    background={reel.background}
                    textures={reel.textures}
                  />
                </div>
              ) : reel.video ? (
                <video
                  src={reel.video}
                  autoPlay={index === safeActiveIdx}
                  muted
                  loop
                  playsInline
                  className="reel-media"
                />
              ) : (
                <img src={reel.image} alt={reel.projectTitle} className="reel-media" />
              )}

              <div className="dark-overlay" />

              <div className="creator-info">
                <div
                  className="creator-profile"
                  onClick={() => {
                    if (user && displayCreatorName === user.username) {
                      navigate('/app/profile');
                    } else {
                      navigate(`/app/creator/${displayCreatorName}`);
                    }
                  }}
                >
                  <div className="avatar-container">
                    <img src={displayAvatar} alt={displayCreatorName} className="avatar-img" />
                    {(!user || displayCreatorName !== user.username) && (
                      <div className="plus-icon-container">
                        <PlusIcon size={8} />
                      </div>
                    )}
                  </div>
                  <div className="creator-details">
                    <div className="creator-name-row">
                      <span className="creator-name">{displayCreatorName}</span>
                      <VerifiedIcon size={12} />
                    </div>
                    <span className="creator-discipline">{reel.discipline}</span>
                  </div>
                </div>

                <div className="project-brief">
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'rgba(255,255,255,0.62)',
                      fontWeight: 700,
                    }}
                  >
                    {reel.sourceLabel}
                  </p>
                  <h3 className="project-title">{reel.projectTitle}</h3>
                  <button
                    onClick={() => setExpandedProj(reel)}
                    className="view-details-btn"
                  >
                    View Details & Process
                    <span style={{ opacity: 0.6 }}>→</span>
                  </button>
                </div>
              </div>

              <div className="action-rail">
                <button
                  onClick={() => handleLike(reel)}
                  className={`action-btn ${isLiked ? 'action-btn--liked' : ''}`}
                >
                  <HeartIcon filled={isLiked} size={18} />
                  <span className="action-count">
                    {formatCount(engagement.likesCount)}
                  </span>
                </button>

                <button onClick={() => openComments(reel)} className="action-btn">
                  <CommentIcon size={18} />
                  <span className="action-count">{formatCount(engagement.commentsCount)}</span>
                </button>

                <button
                  onClick={() => handleSave(reel)}
                  className={`action-btn ${isSaved ? 'action-btn--saved' : ''}`}
                >
                  <BookmarkIcon filled={isSaved} size={18} />
                  <span className="action-count">
                    {formatCount(engagement.savesCount)}
                  </span>
                </button>

                <button
                  onClick={() => handleShare(reel)}
                  className="action-btn"
                >
                  <ShareIcon size={18} />
                  <span className="action-count">
                    {formatCount(engagement.sharesCount)}
                  </span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {commentTarget ? (
        <div className="details-overlay" onClick={() => setCommentTarget(null)}>
          <div className="details-card anim-fade-up" onClick={(event) => event.stopPropagation()}>
            <div className="details-header">
              <div className="details-title-group">
                <span className="details-subtitle">Comments</span>
                <h2 className="details-main-title">{commentTarget.projectTitle}</h2>
              </div>
              <button onClick={() => setCommentTarget(null)} className="close-btn">
                <CloseIcon size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 280, overflowY: 'auto' }}>
              {(commentTarget.engagement?.comments ?? []).length > 0 ? (
                commentTarget.engagement.comments.map((comment) => (
                  <div
                    key={comment.commentId}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 16,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <img
                        src={comment.avatar || DEFAULT_AVATAR}
                        alt={comment.username || comment.name || 'member'}
                        style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                          {comment.username || comment.name || 'CreativeVerse member'}
                        </div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
                          {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : 'Just now'}
                        </div>
                      </div>
                    </div>
                    <p style={{ margin: 0, color: '#e7eaf0', fontSize: 13, lineHeight: 1.5 }}>
                      {comment.text}
                    </p>
                  </div>
                ))
              ) : (
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>
                  No comments yet. Start the conversation.
                </div>
              )}
            </div>

            <form onSubmit={submitComment} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <textarea
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                rows={4}
                placeholder={isGuest ? 'Sign in to comment on this post.' : 'Write a thoughtful comment...'}
                disabled={isGuest || isSubmittingComment}
                style={{
                  width: '100%',
                  borderRadius: 18,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#fff',
                  padding: 14,
                  resize: 'none',
                  outline: 'none',
                  fontSize: 14,
                }}
              />
              <button
                type="submit"
                disabled={isGuest || isSubmittingComment || !commentText.trim()}
                className="btn btn--primary-sm"
                style={{ opacity: isGuest || isSubmittingComment || !commentText.trim() ? 0.65 : 1 }}
              >
                {isSubmittingComment ? 'Posting...' : isGuest ? 'Sign in to comment' : 'Post Comment'}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {expandedProj ? (
        <div className="details-overlay">
          <div className="details-card anim-fade-up">
            <div className="details-header">
              <div className="details-title-group">
                <span className="details-subtitle">Project Showcase</span>
                <h2 className="details-main-title">{expandedProj.projectTitle}</h2>
              </div>
              <button onClick={() => setExpandedProj(null)} className="close-btn">
                <CloseIcon size={18} />
              </button>
            </div>

            <p className="details-description">{expandedProj.description}</p>

            <div className="software-group">
              <span className="software-label">Software Used</span>
              <div className="software-tags">
                {expandedProj.software.map((sw) => (
                  <span key={sw} className="software-tag">
                    {sw}
                  </span>
                ))}
              </div>
            </div>

            <div className="project-tags">
              {expandedProj.tags.map((tag) => (
                <span key={tag} className="project-tag">
                  {tag}
                </span>
              ))}
            </div>

            <button
              onClick={() => {
                window.alert(
                  isGuest
                    ? 'Sign in to collaborate!'
                    : 'Collaboration request sent!',
                )
                setExpandedProj(null)
                if (isGuest) {
                  navigate('/signin')
                }
              }}
              className="collaborate-btn"
            >
              Collaborate on Project
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default HomePage
