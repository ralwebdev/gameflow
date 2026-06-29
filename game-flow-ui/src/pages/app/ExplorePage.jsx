import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VerifiedIcon } from '../../components/icons/Icons';

// ─── Mock Data ──────────────────────────────────────────────────────────────
const CATEGORIES = ['All', '3D', 'Animation', 'VFX', 'Games', 'Concept'];

const FEATURED_CREATORS = [
  { id: 1, name: 'zara_neon', role: 'Senior Animator', avatar: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/19f781f2a-1e76-4c62-8f73-55c5248d45ab.png' },
  { id: 2, name: 'alex_vfx', role: 'VFX Artist', avatar: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/19f781f2a-1e76-4c62-8f73-55c5248d45ab.png' },
  { id: 3, name: 'leo_3d', role: '3D Sculptor', avatar: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/19f781f2a-1e76-4c62-8f73-55c5248d45ab.png' }
];

const TRENDING_PROJECTS = [
  { id: 1, title: 'Volumetric Portal Effect', creator: 'alex_vfx', category: 'VFX', image: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/1bd8db8c4-7446-4905-bbe6-106a3bce5dc2.png', views: '24K' },
  { id: 2, title: 'Cyberpunk Rigging Loop', creator: 'zara_neon', category: 'Animation', image: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/12de9432e-ccf4-418f-a563-5181abb44ff3.png', views: '18K' },
  { id: 3, title: 'Sci-Fi Mech Turntable', creator: 'leo_3d', category: '3D', image: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/1a26c70d3-6e59-4426-897a-6546a2e98a7e.png', views: '32K' }
];

const ExplorePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [followingMap, setFollowingMap] = useState({});

  const toggleFollow = (creatorId, e) => {
    e.stopPropagation();
    setFollowingMap(prev => ({ ...prev, [creatorId]: !prev[creatorId] }));
  };

  const handleCreatorClick = (creatorName) => {
    navigate(`/app/creator/${creatorName}`);
  };

  // Filters
  const filteredProjects = TRENDING_PROJECTS.filter(project => {
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
        background: '#0B0D12',
        overflow: 'hidden',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ─── Search Section (Fixed) ──────────────────────────────────────────────── */}
      <div style={{ padding: '24px 20px 12px', display: 'flex', flexDirection: 'column', gap: 16, background: '#0B0D12', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            flex: 1,
            height: 48,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: 10
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
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
              <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
            </svg>
          </button>
        </div>

        {/* Category Pills */}
        <div className="scrollbar-hide" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {CATEGORIES.map(category => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 100,
                  background: isActive ? '#FF7A59' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isActive ? '#FF7A59' : 'rgba(255,255,255,0.08)'}`,
                  color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Scrollable Content Area (Inside) ────────────────────────────────────── */}
      <div
        className="scrollbar-hide"
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: 100,
        }}
      >
        {/* ─── Featured Creators Section ────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '16px 20px 24px' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: -0.2 }}>
            Featured Creators
          </h2>
          
          <div className="scrollbar-hide" style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
            {FEATURED_CREATORS.map(creator => {
              const isFollowing = !!followingMap[creator.id];
              return (
                <div
                  key={creator.id}
                  onClick={() => handleCreatorClick(creator.name)}
                  style={{
                    width: 140,
                    padding: '16px 12px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    flexShrink: 0,
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', marginBottom: 10, border: '1.5px solid rgba(255,255,255,0.1)' }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                    {creator.name}
                    <VerifiedIcon size={11} />
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', margin: '2px 0 10px', fontWeight: 500 }}>
                    {creator.role}
                  </span>
                  
                  <button
                    onClick={(e) => toggleFollow(creator.id, e)}
                    style={{
                      width: '100%',
                      padding: '6px 0',
                      borderRadius: 10,
                      background: isFollowing ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
                      border: 'none',
                      color: isFollowing ? '#FFFFFF' : '#0B0D12',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Trending Projects Section ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 20px' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: -0.2 }}>
            Trending Projects
          </h2>
          
          {filteredProjects.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filteredProjects.map(project => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/app/project/${project.id}`)}
                  style={{
                    background: '#121620',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 20,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '1.7', overflow: 'hidden' }}>
                    <img src={project.image} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: 'rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(8px)',
                      padding: '4px 10px',
                      borderRadius: 100,
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#FFFFFF'
                    }}>
                      {project.category}
                    </div>
                  </div>
                  
                  <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>
                      {project.title}
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                        by @{project.creator}
                      </span>
                      <span style={{ fontSize: 11, color: '#FF7A59', fontWeight: 600 }}>
                        {project.views} views
                      </span>
                    </div>
                  </div>
                </div>
              ))}
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
