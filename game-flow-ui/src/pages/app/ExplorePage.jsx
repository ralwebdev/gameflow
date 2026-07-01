import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VerifiedIcon } from '../../components/icons/Icons';
import { useAuth } from '../../context/AuthContext';

/* ─── Mock Data ────────────────────────────────────────────────────────────── */
const CATEGORIES = [
  'All', '3D', 'Animation', 'VFX', 'Games', 'Illustration', 'Comics', 'Motion', 'UI/UX', 'AI'
];

const FEATURED_CREATORS = [
  {
    id: 1,
    name: 'zara_neon',
    role: 'Senior Animator',
    avatar: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/19f781f2a-1e76-4c62-8f73-55c5248d45ab.png',
    projectsCount: 24,
    followers: '12.3K',
    ringColor: '#A855F7', // Purple highlight
    isVerified: true,
    isOnline: true
  },
  {
    id: 2,
    name: 'alex_vfx',
    role: 'VFX Artist',
    avatar: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/19f781f2a-1e76-4c62-8f73-55c5248d45ab.png',
    projectsCount: 18,
    followers: '8.7K',
    ringColor: '#3B82F6', // Blue highlight
    isVerified: true,
    isOnline: true
  },
  {
    id: 3,
    name: 'leo_3d',
    role: '3D Sculptor',
    avatar: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/19f781f2a-1e76-4c62-8f73-55c5248d45ab.png',
    projectsCount: 31,
    followers: '15.1K',
    ringColor: '#EC4899', // Pink highlight
    isVerified: true,
    isOnline: true
  }
];

const FEATURED_PROJECT = {
  id: 'featured-trending',
  title: 'Volumetric Portal Effect',
  creator: 'alex_vfx',
  creatorAvatar: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/19f781f2a-1e76-4c62-8f73-55c5248d45ab.png',
  category: 'VFX',
  image: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/1bd8db8c4-7446-4905-bbe6-106a3bce5dc2.png',
  description: 'A volumetric portal simulation created in Houdini & Redshift.',
  likes: '2.3K',
  comments: '142',
  saves: '1.1K'
};

const DISCOVER_PROJECTS = [
  {
    id: 'cyberpunk-street',
    title: 'Cyberpunk Street',
    creator: 'zara_neon',
    category: '3D',
    image: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/1a26c70d3-6e59-4426-897a-6546a2e98a7e.png',
    likes: '1.8K',
    aspect: 'portrait' // for masonry visual rhythm
  },
  {
    id: 'lost-in-thought',
    title: 'Lost In Thought',
    creator: 'motion_soul',
    category: 'Animation',
    image: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/12de9432e-ccf4-418f-a563-5181abb44ff3.png',
    likes: '1.2K',
    aspect: 'square'
  },
  {
    id: 'elden-vale',
    title: 'Elden Vale',
    creator: 'gameforge',
    category: 'Games',
    image: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/1bd8db8c4-7446-4905-bbe6-106a3bce5dc2.png',
    likes: '2.7K',
    aspect: 'landscape'
  },
  {
    id: 'neon-cyber',
    title: 'Mech Chassis Mk-V',
    creator: 'leo_3d',
    category: '3D',
    image: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/1a26c70d3-6e59-4426-897a-6546a2e98a7e.png',
    likes: '3.1K',
    aspect: 'portrait'
  }
];

const ExplorePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [followingMap, setFollowingMap] = useState({});

  const toggleFollow = (creatorId, e) => {
    e.stopPropagation();
    setFollowingMap(prev => ({ ...prev, [creatorId]: !prev[creatorId] }));
  };

  const handleCreatorClick = (creatorName) => {
    if (user && creatorName === user.username) {
      navigate('/app/profile');
    } else {
      navigate(`/app/creator/${creatorName}`);
    }
  };

  const filteredTrending = [FEATURED_PROJECT].filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.creator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || project.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredDiscover = DISCOVER_PROJECTS.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.creator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || project.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div
      className="mobile-frame"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        background: '#090909',
        overflow: 'hidden',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ─── Search & Category Section ────────────────────────────────────────── */}
      <div style={{
        padding: '24px 20px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        background: '#090909',
        zIndex: 10,
        flexShrink: 0
      }}>
        {/* Search Bar + Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            flex: 1,
            height: 48,
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: 10,
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 4px 18px rgba(0,0,0,0.2)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search creators, projects, studios..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#FFFFFF',
                fontSize: 14,
                fontFamily: 'inherit'
              }}
            />
          </div>
          <button style={{
            width: 48,
            height: 48,
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
              <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
            </svg>
          </button>
        </div>

        {/* Category Horizontally Scrollable Pills */}
        <div className="scrollbar-hide" style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {CATEGORIES.map(category => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 100,
                  background: isActive ? 'linear-gradient(135deg, #FF7A5C 0%, #E65C40 100%)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isActive ? 'transparent' : 'rgba(255,255,255,0.06)'}`,
                  color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isActive ? '0 4px 12px rgba(255, 122, 92, 0.25)' : 'none',
                }}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Scrollable Content Area ──────────────────────────────────────────── */}
      <div
        className="scrollbar-hide"
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: 110,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {/* ─── Horizontal Featured Creators Section ───────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '16px 20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: -0.2 }}>
              Featured Creators
            </h2>
            <span style={{ fontSize: 12, color: '#FF7A5C', fontWeight: 600, cursor: 'pointer' }}>View all &gt;</span>
          </div>

          <div className="scrollbar-hide" style={{
            display: 'flex',
            gap: 12,
            overflowX: 'auto',
            paddingBottom: 8,
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            {FEATURED_CREATORS.map(creator => {
              const isFollowing = !!followingMap[creator.id];
              return (
                <div
                  key={creator.id}
                  onClick={() => handleCreatorClick(creator.name)}
                  style={{
                    width: 142,
                    padding: '18px 14px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: 22,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    flexShrink: 0,
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  <div style={{ position: 'relative', width: 62, height: 62, marginBottom: 10 }}>
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: `2px solid ${creator.ringColor || '#FF7A5C'}`,
                        boxShadow: `0 4px 12px ${creator.ringColor}22`
                      }}
                    />
                    {creator.isOnline && (
                      <div style={{
                        position: 'absolute', bottom: 2, right: 2,
                        width: 11, height: 11, borderRadius: '50%',
                        background: '#34D399', border: '2px solid #090909'
                      }} />
                    )}
                  </div>

                  <span style={{ fontSize: 13.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, height: 18, overflow: 'hidden' }}>
                    {creator.name}
                    {creator.isVerified && <VerifiedIcon size={12} />}
                  </span>

                  <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)', margin: '2px 0 10px', fontWeight: 500 }}>
                    {creator.role}
                  </span>

                  <span style={{ fontSize: 9.5, color: '#A1A1AA', marginBottom: 14 }}>
                    {creator.projectsCount} Projects · {creator.followers} Followers
                  </span>

                  <button
                    onClick={(e) => toggleFollow(creator.id, e)}
                    style={{
                      width: '100%',
                      padding: '8px 0',
                      borderRadius: 100,
                      background: isFollowing ? 'transparent' : '#FFFFFF',
                      border: `1px solid ${isFollowing ? 'rgba(255,255,255,0.2)' : '#FFFFFF'}`,
                      color: isFollowing ? '#FFFFFF' : '#090909',
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Trending Projects (Large Feature Card) ─────────────────────────── */}
        {filteredTrending.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '0 20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: -0.2 }}>
                Trending Projects
              </h2>
              <span style={{ fontSize: 12, color: '#FF7A5C', fontWeight: 600, cursor: 'pointer' }}>View all &gt;</span>
            </div>

            {filteredTrending.map(project => (
              <div
                key={project.id}
                onClick={() => navigate(`/app/project/${project.id}`)}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: 24,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                }}
              >
                <div style={{ position: 'relative', width: '100%', aspectRatio: '1.8', overflow: 'hidden' }}>
                  <img src={project.image} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {/* Subtle dark gradient overlay */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(9,9,9,0.1) 60%, rgba(9,9,9,0.85) 100%)'
                  }} />
                  <div style={{
                    position: 'absolute', top: 14, left: 14,
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    padding: '4px 10px',
                    borderRadius: 100,
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#FFFFFF',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}>
                    {project.category}
                  </div>
                </div>

                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>
                      {project.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <img src={project.creatorAvatar} alt={project.creator} style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} />
                      <span style={{ fontSize: 12.5, color: '#A1A1AA', fontWeight: 600 }}>by {project.creator}</span>
                      <VerifiedIcon size={11} />
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: 13, color: '#A1A1AA', lineHeight: 1.45 }}>
                    {project.description}
                  </p>

                  <div style={{ display: 'flex', gap: 14, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 12, marginTop: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      {project.likes}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                      {project.comments}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                      {project.saves}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── Discover Grid (Masonry visual rhythm) ─────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '0 20px' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: -0.2 }}>
            Discover
          </h2>

          {filteredDiscover.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}>
              {/* Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredDiscover.filter((_, idx) => idx % 2 === 0).map(project => (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/app/project/${project.id}`)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: 20,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                  >
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: project.aspect === 'portrait' ? '0.75' : project.aspect === 'square' ? '1' : '1.5',
                      overflow: 'hidden'
                    }}>
                      <img src={project.image} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{
                        position: 'absolute', top: 10, left: 10,
                        background: 'rgba(9, 9, 9, 0.5)',
                        backdropFilter: 'blur(8px)',
                        padding: '3px 8px',
                        borderRadius: 100,
                        fontSize: 9,
                        fontWeight: 700,
                        color: '#FFFFFF'
                      }}>
                        {project.category}
                      </div>
                    </div>

                    <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {project.title}
                      </h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                          @{project.creator}
                        </span>
                        <span style={{ fontSize: 11, color: '#FF7A5C', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                          {project.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredDiscover.filter((_, idx) => idx % 2 !== 0).map(project => (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/app/project/${project.id}`)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: 20,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                  >
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: project.aspect === 'portrait' ? '0.75' : project.aspect === 'square' ? '1' : '1.5',
                      overflow: 'hidden'
                    }}>
                      <img src={project.image} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{
                        position: 'absolute', top: 10, left: 10,
                        background: 'rgba(9, 9, 9, 0.5)',
                        backdropFilter: 'blur(8px)',
                        padding: '3px 8px',
                        borderRadius: 100,
                        fontSize: 9,
                        fontWeight: 700,
                        color: '#FFFFFF'
                      }}>
                        {project.category}
                      </div>
                    </div>

                    <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {project.title}
                      </h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                          @{project.creator}
                        </span>
                        <span style={{ fontSize: 11, color: '#FF7A5C', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                          {project.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#B8C0CC', fontSize: 14 }}>
              No projects found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
