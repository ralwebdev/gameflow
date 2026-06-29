import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import WebGLGamePlayer from '../../components/WebGLGamePlayer';
import GltfAssetViewer from '../../components/GltfAssetViewer';
import wavingVideo from '../../assets/wave.mp4';
import logoImg from '../../assets/logo.jpg';
import {
  PlusIcon,
  HeartIcon, CommentIcon, BookmarkIcon, ShareIcon, VerifiedIcon, CloseIcon
} from '../../components/icons/Icons';
import './HomePage.css';

// ─── Mock Data ──────────────────────────────────────────────────────────────
const REELS_DATA = [
  {
    id: 1,
    creatorName: 'alex_vfx',
    discipline: 'VFX Artist',
    avatar: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/19f781f2a-1e76-4c62-8f73-55c5248d45ab.png',
    video: wavingVideo,
    likesCount: 12400,
    commentsCount: 843,
    savesCount: 2100,
    projectTitle: 'Volumetric Portal Effect',
    description: 'Real-time volumetric portal simulation in Unreal Engine 5.2. Testing Niagara fluids combined with custom HLSL raymarching shaders for deep cinematic layering.',
    software: ['Unreal Engine', 'Houdini', 'Nuke'],
    tags: ['#vfx', '#ue5', '#realtime', '#simulation'],
  },
  {
    id: 4,
    creatorName: 'flappy_dev',
    discipline: 'Game Developer',
    avatar: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/19f781f2a-1e76-4c62-8f73-55c5248d45ab.png',
    type: 'game',
    gameUrl: '/games/Flappy Bird/Build/index.html',
    mode: 'portrait',
    thumbnailMode: 'portrait',
    likesCount: 15400,
    commentsCount: 943,
    savesCount: 3100,
    projectTitle: 'Flappy Bird Clone',
    description: 'Recreation of the classic Flappy Bird game using Unity WebGL.',
    software: ['Unity', 'C#'],
    tags: ['#game', '#webgl', '#unity'],
  },
  {
    id: 5,
    creatorName: 'prop_master',
    discipline: '3D Modeler',
    avatar: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/19f781f2a-1e76-4c62-8f73-55c5248d45ab.png',
    type: '3d',
    modelUrl: '/3dAssets/hammer.glb',
    mode: 'portrait',
    likesCount: 6800,
    commentsCount: 312,
    savesCount: 1200,
    projectTitle: 'Thor Hammer Prop',
    description: 'A highly detailed 3D model of a hammer. Viewable directly in the browser.',
    software: ['Blender', 'Substance Painter'],
    tags: ['#3d', '#props', '#modeling'],
  },
  {
    id: 7,
    creatorName: 'avik_art',
    discipline: '3D Asset Artist',
    avatar: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/19f781f2a-1e76-4c62-8f73-55c5248d45ab.png',
    type: '3d',
    modelUrl: '/3dAssets/Avik model file 1/Avik model file/Model/Shoe Model.glb',
    textures: {
      map: '/3dAssets/Avik model file 1/Avik model file/Texture/Uv unfold fbx_standardSurface2_BaseColor.1001.png',
      normalMap: '/3dAssets/Avik model file 1/Avik model file/Texture/Uv unfold fbx_standardSurface2_Normal.1001.png',
      roughnessMap: '/3dAssets/Avik model file 1/Avik model file/Texture/Uv unfold fbx_standardSurface2_Roughness.1001.png',
      metalnessMap: '/3dAssets/Avik model file 1/Avik model file/Texture/Uv unfold fbx_standardSurface2_Metallic.1001.png',
      emissiveMap: '/3dAssets/Avik model file 1/Avik model file/Texture/Uv unfold fbx_standardSurface2_Emissive.1001.png',
    },
    mode: 'portrait',
    likesCount: 9800,
    commentsCount: 432,
    savesCount: 1780,
    projectTitle: 'Avik Athletic Shoe',
    description: 'A beautifully styled athletic shoe designed with complex fabric weave maps, normal displacements, and rubberized sole textures.',
    software: ['Maya', 'Substance Painter', 'ZBrush'],
    tags: ['#3d', '#shoe', '#modeling', '#texturing'],
  },
  {
    id: 6,
    creatorName: 'money_maker',
    discipline: 'Game Studio',
    avatar: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/19f781f2a-1e76-4c62-8f73-55c5248d45ab.png',
    type: 'game',
    gameUrl: '/games/Money Ladder/index.html',
    mode: 'landscape',
    thumbnailMode: 'portrait',
    likesCount: 8900,
    commentsCount: 450,
    savesCount: 2200,
    projectTitle: 'Money Ladder WebGL',
    description: 'An interactive web-based game. Climb the ladder to success!',
    software: ['Unity', 'WebGL'],
    tags: ['#webgl', '#game', '#interactive'],
  },
  
  {
    id: 2,
    creatorName: 'zara_neon',
    discipline: 'Senior Animator',
    avatar: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/19f781f2a-1e76-4c62-8f73-55c5248d45ab.png',
    image: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/12de9432e-ccf4-418f-a563-5181abb44ff3.png',
    likesCount: 9800,
    commentsCount: 412,
    savesCount: 1500,
    projectTitle: 'Cyberpunk Rigging Loop',
    description: 'Rigging and character animation tests for a cyberpunk game project. Fully optimized for high-refresh mobile game engines.',
    software: ['Blender', 'Substance Painter', 'Maya'],
    tags: ['#3d', '#animation', '#cyberpunk', '#blender'],
  }
];

const HomePage = () => {
  const navigate = useNavigate();
  const { isGuest } = useAuth();
  const [activeIdx, setActiveIdx] = useState(0);
  const [expandedProj, setExpandedProj] = useState(null); // project object if open
  const [likedMap, setLikedMap] = useState({}); // id -> bool
  const [savedMap, setSavedMap] = useState({}); // id -> bool
  const feedContainerRef = useRef(null);

  const handleScroll = () => {
    if (!feedContainerRef.current) return;
    const scrollPos = feedContainerRef.current.scrollTop;
    const cardHeight = feedContainerRef.current.clientHeight;
    const newIdx = Math.round(scrollPos / cardHeight);
    if (newIdx !== activeIdx && newIdx >= 0 && newIdx < REELS_DATA.length) {
      setActiveIdx(newIdx);
      // Close expanded project details on swipe to next reel
      setExpandedProj(null);
    }
  };

  const handleLike = (id) => {
    setLikedMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = (id) => {
    setSavedMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="home-page">
      {/* ─── Top Bar (Floating) ────────────────────────────────────────────────── */}
      <header className="home-header">
        {/* Logo */}
        <div className="logo-container">
          <img src={logoImg} alt="CreativeVerse" className="logo-img" />
          <span className="logo-text">CreativeVerse</span>
        </div>

        {/* Search */}
        <button
          onClick={() => navigate('/app/explore')}
          className="search-btn"
          aria-label="Search"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </header>

      {/* ─── Reels Feed Container (Vertical Snap Scroll) ───────────────────────── */}
      <div
        ref={feedContainerRef}
        onScroll={handleScroll}
        className="reels-container"
      >
        {REELS_DATA.map((reel, index) => {
          const isLiked = !!likedMap[reel.id];
          const isSaved = !!savedMap[reel.id];
          const displayLikes = reel.likesCount + (isLiked ? 1 : 0);

          return (
            <div key={reel.id} className="reel-card">
              {/* Main Media Background */}
              {reel.type === 'game' ? (
                <div style={{ width: '100%', height: '100%', pointerEvents: index === activeIdx ? 'auto' : 'none' }}>
                  <WebGLGamePlayer gameUrl={reel.gameUrl} mode={reel.mode} thumbnailMode={reel.thumbnailMode} />
                </div>
              ) : reel.type === '3d' ? (
                <div style={{ width: '100%', height: '100%', pointerEvents: index === activeIdx ? 'auto' : 'none' }}>
                  <GltfAssetViewer modelUrl={reel.modelUrl} textures={reel.textures} mode={reel.mode ?? 'portrait'} />
                </div>
              ) : reel.video ? (
                <video
                  src={reel.video}
                  autoPlay={index === activeIdx}
                  muted
                  loop
                  playsInline
                  className="reel-media"
                />
              ) : (
                <img
                  src={reel.image}
                  alt={reel.projectTitle}
                  className="reel-media"
                />
              )}

              {/* Dark Overlay Vignette */}
              <div className="dark-overlay" />

              {/* Left Overlay: Creator Info */}
              <div className="creator-info">
                {/* Creator Profile */}
                <div
                  className="creator-profile"
                  onClick={() => navigate(`/app/creator/${reel.creatorName}`)}
                >
                  <div className="avatar-container">
                    <img
                      src={reel.avatar}
                      alt={reel.creatorName}
                      className="avatar-img"
                    />
                    <div className="plus-icon-container">
                      <PlusIcon size={8} />
                    </div>
                  </div>
                  <div className="creator-details">
                    <div className="creator-name-row">
                      <span className="creator-name">{reel.creatorName}</span>
                      <VerifiedIcon size={12} />
                    </div>
                    <span className="creator-discipline">
                      {reel.discipline}
                    </span>
                  </div>
                </div>

                {/* Project Brief */}
                <div className="project-brief">
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

              {/* Right Action Rail (Vertical Buttons) */}
              <div className="action-rail">
                {/* Like */}
                <button
                  onClick={() => handleLike(reel.id)}
                  className={`action-btn ${isLiked ? 'action-btn--liked' : ''}`}
                >
                  <HeartIcon filled={isLiked} size={18} />
                  <span className="action-count">{displayLikes >= 1000 ? `${(displayLikes/1000).toFixed(1)}k` : displayLikes}</span>
                </button>

                {/* Comment */}
                <button
                  onClick={() => setExpandedProj(reel)}
                  className="action-btn"
                >
                  <CommentIcon size={18} />
                  <span className="action-count">{reel.commentsCount}</span>
                </button>

                {/* Bookmark/Save */}
                <button
                  onClick={() => handleSave(reel.id)}
                  className={`action-btn ${isSaved ? 'action-btn--saved' : ''}`}
                >
                  <BookmarkIcon filled={isSaved} size={18} />
                  <span className="action-count">{reel.savesCount >= 1000 ? `${(reel.savesCount/1000).toFixed(1)}k` : reel.savesCount}</span>
                </button>

                {/* Share */}
                <button
                  onClick={() => alert('Link copied to clipboard!')}
                  className="action-btn"
                >
                  <ShareIcon size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Progressive Disclosure Details Sheet (Blurred Overlay Drawer) ─────── */}
      {expandedProj && (
        <div className="details-overlay">
          {/* Bottom Card */}
          <div className="details-card anim-fade-up">
            {/* Drawer Header */}
            <div className="details-header">
              <div className="details-title-group">
                <span className="details-subtitle">
                  Project Showcase
                </span>
                <h2 className="details-main-title">
                  {expandedProj.projectTitle}
                </h2>
              </div>
              <button
                onClick={() => setExpandedProj(null)}
                className="close-btn"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            {/* Description */}
            <p className="details-description">
              {expandedProj.description}
            </p>

            {/* Software Used */}
            <div className="software-group">
              <span className="software-label">
                Software Used
              </span>
              <div className="software-tags">
                {expandedProj.software.map(sw => (
                  <span key={sw} className="software-tag">
                    {sw}
                  </span>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="project-tags">
              {expandedProj.tags.map(t => (
                <span key={t} className="project-tag">
                  {t}
                </span>
              ))}
            </div>

            {/* Collaborate CTA */}
            <button
              onClick={() => {
                alert(isGuest ? 'Sign in to collaborate!' : 'Collaboration request sent!');
                setExpandedProj(null);
                if (isGuest) {
                  navigate('/signin');
                }
              }}
              className="collaborate-btn"
            >
              Collaborate on Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
