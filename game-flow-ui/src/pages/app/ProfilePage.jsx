import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GuestBanner from '../../components/layout/GuestBanner';
import GuestToast from '../../components/layout/GuestToast';
import {
  ChevronLeftIcon, ShareIcon2, VerifiedIcon, HeartIcon,
  ChevronDownIcon, CubeIcon, AfterEffectsIcon, GameIcon, ZBrushIcon
} from '../../components/icons/Icons';

/* ─── Local SVG Icons ─────────────────────────────────────── */
const SettingsIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

/* ─── Mock Data ───────────────────────────────────────────── */
const SKILLS = [
  { name: 'Blender', icon: <CubeIcon /> },
  { name: 'After Effects', icon: <AfterEffectsIcon /> },
  { name: 'Unreal Engine', icon: <GameIcon /> },
  { name: 'ZBrush', icon: <ZBrushIcon /> },
];

const PROJECTS = [
  { id: 1, category: '3D Render', image: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/1bd8db8c4-7446-4905-bbe6-106a3bce5dc2.png', likes: '8.4k', tall: true },
  { id: 2, category: 'FX',        image: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/1a26c70d3-6e59-4426-897a-6546a2e98a7e.png', likes: '5.7k', tall: false },
  { id: 3, category: 'Environment',image: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/18b6190b4-15eb-4568-9328-53c6d187c8c3.png', likes: '3.1k', tall: false },
  { id: 4, category: 'VFX',       image: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/12de9432e-ccf4-418f-a563-5181abb44ff3.png', likes: '19k',  tall: true },
  { id: 5, category: 'Concept',   image: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/18be33d7f-6129-4806-a387-7568fee9b096.png', likes: '12k',  tall: false },
  { id: 6, category: 'Sculpt',    image: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/1097bcf9c-55f8-4aa3-8544-7e63de8dd465.png', likes: '6.2k', tall: false },
];

const AVATAR = 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/19f781f2a-1e76-4c62-8f73-55c5248d45ab.png';
const BANNER = 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/1097bcf9c-55f8-4aa3-8544-7e63de8dd465.png';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { isGuest, logout, user } = useAuth();
  
  // Default visible tabs
  const [activeTab, setActiveTab] = useState('Projects'); // 'Projects' | 'Reels' | 'Saved' | 'Models' | 'Games' | 'About'
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [toast, setToast] = useState(null);
  const [likedMap, setLikedMap] = useState({});

  const handleGuestAction = (actionName) => {
    setToast({ action: actionName });
  };

  const handleLike = (id, e) => {
    e.stopPropagation();
    if (isGuest) { handleGuestAction('Like projects'); return; }
    setLikedMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const displayName = user?.name || 'Zara Neon';
  const handleName = user?.username ? `@${user.username}` : '@zaraneon';

  const visibleSkills = SKILLS.slice(0, 3);
  const remainingSkillsCount = SKILLS.length - 3;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        background: '#0B0D12',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Scrollable Content Area */}
      <div
        className="scrollbar-hide"
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: 110,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {/* Guest banner */}
        {isGuest && <GuestBanner onSignIn={() => navigate('/signin')} />}

        {/* Banner with Cinematic Gradient */}
        <div style={{ position: 'relative', width: '100%', height: 180, overflow: 'hidden', flexShrink: 0 }}>
          <img src={BANNER} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(11, 13, 18, 0.4) 0%, rgba(11, 13, 18, 0.95) 100%)',
            }}
          />
          
          {/* Header Glass Buttons */}
          <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => navigate('/app/home')}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            >
              <ChevronLeftIcon size={18} />
            </button>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => alert('Link copied to clipboard!')}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              >
                <ShareIcon2 size={16} />
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to log out?')) {
                    logout();
                    navigate('/signin');
                  }
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              >
                <SettingsIcon size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Profile Details Container */}
        <div style={{ padding: '0 20px 16px', marginTop: -40, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {/* Avatar with Minimal Premium Border */}
          <div style={{ position: 'relative', width: 84, height: 84, marginBottom: 12 }}>
            <img
              src={AVATAR}
              alt={displayName}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #FF7A59',
                boxShadow: '0 4px 16px rgba(255, 122, 89, 0.25)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: '#FF7A59',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #0B0D12',
              }}
            >
              <VerifiedIcon />
            </div>
          </div>

          {/* Profile Identity */}
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 2px', letterSpacing: -0.4 }}>{displayName}</h1>
          <p style={{ fontSize: 13, color: '#FF7A59', margin: '0 0 6px', fontWeight: 600 }}>{handleName}</p>
          <p style={{ fontSize: 13, color: '#B8C0CC', margin: '0 0 16px', fontWeight: 500 }}>
            Senior Animator · VFX Artist · Dreamer
          </p>

          {/* Premium Skill Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
            {visibleSkills.map(skill => (
              <div
                key={skill.name}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 12px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#B8C0CC',
                }}
              >
                {skill.icon}
                {skill.name}
              </div>
            ))}
            {remainingSkillsCount > 0 && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '5px 10px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#FF7A59',
                }}
              >
                +{remainingSkillsCount}
              </div>
            )}
          </div>

          {/* Clean Stats Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 20,
              width: '100%',
              padding: '12px 0',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', gap: 6, fontSize: 13, fontWeight: 500, color: '#B8C0CC' }}>
              <span style={{ color: '#FFFFFF', fontWeight: 700 }}>248</span> Projects
            </div>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
            <div style={{ display: 'flex', gap: 6, fontSize: 13, fontWeight: 500, color: '#B8C0CC' }}>
              <span style={{ color: '#FFFFFF', fontWeight: 700 }}>1.2M</span> Followers
            </div>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
            <div style={{ display: 'flex', gap: 6, fontSize: 13, fontWeight: 500, color: '#B8C0CC' }}>
              <span style={{ color: '#FFFFFF', fontWeight: 700 }}>340</span> Following
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', width: '100%', gap: 10, paddingBottom: 8 }}>
            <button
              onClick={() => alert('Edit Profile clicked')}
              style={{
                flex: 2,
                height: 44,
                borderRadius: 12,
                background: '#FF7A59',
                border: 'none',
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(255, 122, 89, 0.2)',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = 0.9}
              onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
            >
              Edit Profile
            </button>
            <button
              onClick={() => alert('Profile URL copied!')}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 12,
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Share
            </button>
          </div>
        </div>

        {/* Tab Controls (Projects, Reels, Saved, More Menu) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '0 20px',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', gap: 20 }}>
            {['Projects', 'Reels', 'Saved'].map(tab => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setShowMoreMenu(false);
                  }}
                  style={{
                    padding: '14px 0',
                    background: 'none',
                    border: 'none',
                    borderBottom: isActive ? '2px solid #FF7A59' : '2px solid transparent',
                    color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* More Tabs Trigger */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              style={{
                padding: '14px 0',
                background: 'none',
                border: 'none',
                color: ['Models', 'Games', 'About'].includes(activeTab) ? '#FF7A59' : 'rgba(255,255,255,0.5)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {['Models', 'Games', 'About'].includes(activeTab) ? activeTab : 'More'}
              <ChevronDownIcon size={14} />
            </button>

            {/* Dropdown Menu */}
            {showMoreMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  width: 130,
                  background: '#121620',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  padding: '6px',
                  zIndex: 40,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {['Models', 'Games', 'About'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setShowMoreMenu(false);
                    }}
                    style={{
                      padding: '8px 12px',
                      background: activeTab === tab ? 'rgba(255,255,255,0.05)' : 'transparent',
                      border: 'none',
                      borderRadius: 8,
                      color: activeTab === tab ? '#FF7A59' : '#B8C0CC',
                      fontSize: 12,
                      fontWeight: 600,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => { if (activeTab !== tab) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                    onMouseLeave={(e) => { if (activeTab !== tab) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tab Content Panels */}
        <div style={{ padding: 12 }}>
          {activeTab === 'Projects' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {PROJECTS.map(proj => {
                const isLiked = likedMap[proj.id];
                return (
                  <div
                    key={proj.id}
                    onClick={() => navigate(`/app/project/${proj.id}`)}
                    style={{
                      position: 'relative',
                      borderRadius: 16,
                      overflow: 'hidden',
                      aspectRatio: proj.tall ? '0.78' : '1.1',
                      cursor: 'pointer',
                      background: '#121620',
                      border: '1px solid rgba(255,255,255,0.04)',
                      transition: 'transform 0.2s ease, border-color 0.2s ease',
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <img src={proj.image} alt={proj.category} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    
                    {/* Dark bottom vignette */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 50%)',
                        pointerEvents: 'none',
                      }}
                    />

                    {/* Category Pill */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 10,
                        left: 10,
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        padding: '3px 8px',
                        borderRadius: 100,
                        fontSize: 9,
                        fontWeight: 700,
                        color: '#FFFFFF',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      {proj.category}
                    </div>

                    {/* Like Action */}
                    <div
                      onClick={(e) => handleLike(proj.id, e)}
                      style={{
                        position: 'absolute',
                        bottom: 8,
                        right: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        color: isLiked ? '#FF7A59' : '#FFFFFF',
                        cursor: 'pointer',
                      }}
                    >
                      <HeartIcon filled={isLiked} size={14} />
                      <span>{isLiked ? '1.3k' : proj.likes}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'Reels' && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#B8C0CC', fontSize: 13 }}>
              No shared reels yet.
            </div>
          )}

          {activeTab === 'Saved' && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#B8C0CC', fontSize: 13 }}>
              Saved showcases will appear here.
            </div>
          )}

          {['Models', 'Games', 'About'].includes(activeTab) && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#B8C0CC', fontSize: 13 }}>
              {activeTab} content is currently empty.
            </div>
          )}
        </div>
      </div>

      {/* Guest Toast */}
      {toast && (
        <GuestToast
          message={`Sign in to ${toast.action} on CreativeVerse.`}
          onSignIn={() => { setToast(null); navigate('/signin'); }}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ProfilePage;
