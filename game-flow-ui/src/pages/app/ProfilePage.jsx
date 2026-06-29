import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchContent } from '../../lib/content';
import GuestBanner from '../../components/layout/GuestBanner';
import GuestToast from '../../components/layout/GuestToast';
import {
  ChevronLeftIcon, ShareIcon2, VerifiedIcon, HeartIcon,
  ChevronDownIcon, CubeIcon, AfterEffectsIcon, GameIcon, ZBrushIcon
} from '../../components/icons/Icons';

const SettingsIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const PROJECTS = [
  { id: 1, category: '3D Render', image: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/1bd8db8c4-7446-4905-bbe6-106a3bce5dc2.png', likes: '8.4k', tall: true },
  { id: 2, category: 'FX', image: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/1a26c70d3-6e59-4426-897a-6546a2e98a7e.png', likes: '5.7k', tall: false },
  { id: 3, category: 'Environment', image: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/18b6190b4-15eb-4568-9328-53c6d187c8c3.png', likes: '3.1k', tall: false },
  { id: 4, category: 'VFX', image: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/12de9432e-ccf4-418f-a563-5181abb44ff3.png', likes: '19k', tall: true },
  { id: 5, category: 'Concept', image: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/18be33d7f-6129-4806-a387-7568fee9b096.png', likes: '12k', tall: false },
  { id: 6, category: 'Sculpt', image: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/1097bcf9c-55f8-4aa3-8544-7e63de8dd465.png', likes: '6.2k', tall: false },
];

const AVATAR = 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/19f781f2a-1e76-4c62-8f73-55c5248d45ab.png';
const BANNER = 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/1097bcf9c-55f8-4aa3-8544-7e63de8dd465.png';

const fieldStyle = {
  height: 48,
  borderRadius: 12,
  background: 'rgba(15, 23, 42, 0.72)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#FFF',
  padding: '0 14px',
  fontSize: 14,
  outline: 'none',
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { isGuest, logout, user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('Projects');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [toast, setToast] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [likedMap, setLikedMap] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editName, setEditName] = useState('');
  const [editHeadline, setEditHeadline] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editBanner, setEditBanner] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [userProjects, setUserProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  useEffect(() => {
    let timeoutId = null;

    const handleProfileUpdate = () => {
      setToastMsg('Profile updated successfully!');
      timeoutId = window.setTimeout(() => setToastMsg(null), 3000);
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }

      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (isGuest || !user) return;

    async function loadUserContent() {
      setIsLoadingProjects(true);
      try {
        const data = await fetchContent();
        if (!isMounted) return;
        const allProjects = Array.isArray(data?.projects) ? data.projects : [];
        const filtered = allProjects.filter(
          (proj) => String(proj.ownerId) === String(user.id || user._id)
        );
        setUserProjects(filtered);
      } catch (err) {
        console.error('Failed to load user projects:', err);
      } finally {
        if (isMounted) {
          setIsLoadingProjects(false);
        }
      }
    }

    loadUserContent();
    return () => {
      isMounted = false;
    };
  }, [user, isGuest]);

  const handleGuestAction = (actionName) => {
    setToast({ action: actionName });
  };

  const handleOpenEdit = () => {
    if (isGuest) {
      handleGuestAction('Edit Profile');
      return;
    }

    setEditEmail(user?.email || '');
    setEditUsername(user?.username || '');
    setEditName(user?.name || '');
    setEditHeadline(user?.headline || '');
    setEditSkills(user?.skills?.join(', ') || '');
    setEditAvatar(user?.avatar || '');
    setEditBanner(user?.banner || '');
    setIsEditing(true);
  };

  const handleImageChange = (event, setImage) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image is too large. Please choose an image under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    if (isGuest) return;

    setIsSaving(true);

    try {
      const skillsArray = editSkills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean);

      await updateProfile({
        email: editEmail,
        username: editUsername,
        name: editName,
        headline: editHeadline,
        skills: skillsArray,
        avatar: editAvatar,
        banner: editBanner,
      });

      setIsEditing(false);
    } catch (error) {
      alert(error.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLike = (id, event) => {
    event.stopPropagation();
    if (isGuest) {
      handleGuestAction('Like projects');
      return;
    }
    setLikedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const displayName = user?.name || 'CreativeVerse User';
  const handleName = user?.username ? `@${user.username}` : '@creativeverse';
  const userHeadline = user?.headline || 'Add a headline in Edit Profile.';
  const userAvatar = user?.avatar || AVATAR;
  const userBanner = user?.banner || BANNER;
  const dynamicSkills = Array.isArray(user?.skills) ? user.skills : [];
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    : 'Recently';

  const getSkillIcon = (name) => {
    const lower = String(name).toLowerCase();
    if (lower.includes('blender')) return <CubeIcon />;
    if (lower.includes('after') || lower.includes('effects') || lower.includes('ae')) return <AfterEffectsIcon />;
    if (lower.includes('unreal') || lower.includes('unity') || lower.includes('game') || lower.includes('engine')) return <GameIcon />;
    if (lower.includes('zbrush') || lower.includes('sculpt')) return <ZBrushIcon />;
    return <CubeIcon />;
  };

  const visibleSkills = dynamicSkills.slice(0, 3).map((skillName) => ({
    name: skillName,
    icon: getSkillIcon(skillName),
  }));
  const remainingSkillsCount = Math.max(dynamicSkills.length - 3, 0);

  const profileCompletion = useMemo(() => {
    const checks = [
      Boolean(user?.name),
      Boolean(user?.email),
      Boolean(user?.username),
      Boolean(user?.headline),
      Boolean(user?.avatar),
      Array.isArray(user?.skills) && user.skills.length > 0,
    ];

    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
  }, [user]);

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
        {isGuest && <GuestBanner onSignIn={() => navigate('/signin')} />}

        <div style={{ position: 'relative', width: '100%', height: 180, overflow: 'hidden', flexShrink: 0 }}>
          <img src={userBanner} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(11, 13, 18, 0.4) 0%, rgba(11, 13, 18, 0.95) 100%)',
            }}
          />

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
              }}
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
                }}
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
                }}
              >
                <SettingsIcon size={16} />
              </button>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 20px 16px', marginTop: -40, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 84, height: 84, marginBottom: 12 }}>
            <img
              src={userAvatar}
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

          <h1 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 2px', letterSpacing: -0.4 }}>{displayName}</h1>
          <p style={{ fontSize: 13, color: '#FF7A59', margin: '0 0 6px', fontWeight: 600 }}>{handleName}</p>
          <p style={{ fontSize: 13, color: '#B8C0CC', margin: '0 0 16px', fontWeight: 500 }}>{userHeadline}</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
            {visibleSkills.map((skill) => (
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
            {dynamicSkills.length === 0 && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '5px 12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px dashed rgba(255,255,255,0.12)',
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#8F98A8',
                }}
              >
                No skills added yet
              </div>
            )}
          </div>

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
              <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{dynamicSkills.length}</span> Skills
            </div>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
            <div style={{ display: 'flex', gap: 6, fontSize: 13, fontWeight: 500, color: '#B8C0CC' }}>
              <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{profileCompletion}%</span> Complete
            </div>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
            <div style={{ display: 'flex', gap: 6, fontSize: 13, fontWeight: 500, color: '#B8C0CC' }}>
              <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{memberSince}</span> Joined
            </div>
          </div>

          <div style={{ display: 'flex', width: '100%', gap: 10, paddingBottom: 8 }}>
            <button
              onClick={handleOpenEdit}
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
              }}
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
              }}
            >
              Share
            </button>
          </div>
        </div>

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
            {['Projects', 'Reels', 'Saved'].map((tab) => {
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
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

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
                {['Models', 'Games', 'About'].map((tab) => (
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
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: 12 }}>
          {activeTab === 'Projects' && (
            <>
              {isLoadingProjects ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#B8C0CC', fontSize: 13 }}>
                  Loading your portfolio...
                </div>
              ) : userProjects.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {userProjects.map((proj) => {
                    const isLiked = !!likedMap[proj.id];
                    const isTall = proj.mode === 'portrait';
                    const imageSrc = proj.previewUrl || proj.imageUrl || BANNER;
                    return (
                      <div
                        key={proj.id}
                        onClick={() => navigate(`/app/project/${proj.id}`)}
                        style={{
                          position: 'relative',
                          borderRadius: 16,
                          overflow: 'hidden',
                          aspectRatio: isTall ? '0.78' : '1.1',
                          cursor: 'pointer',
                          background: '#121620',
                          border: '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        <img src={imageSrc} alt={proj.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 50%)',
                            pointerEvents: 'none',
                          }}
                        />
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
                        <div
                          onClick={(event) => handleLike(proj.id, event)}
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
                          <span>{isLiked ? '1' : '0'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#B8C0CC' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>No projects published yet</div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', maxWidth: 260, margin: '0 auto 20px', lineHeight: '1.6' }}>
                    Upload your WebGL builds, 3D files, or 2D artwork and showcase them on your profile.
                  </p>
                  <button
                    onClick={() => navigate('/app/upload')}
                    style={{
                      background: 'linear-gradient(135deg, #FF7A59 0%, #FF522C 100%)',
                      border: 'none',
                      borderRadius: 100,
                      color: '#FFFFFF',
                      padding: '10px 22px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(255, 122, 89, 0.25)',
                    }}
                  >
                    Upload First Project
                  </button>
                </div>
              )}
            </>
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

      {toast && (
        <GuestToast
          message={`Sign in to ${toast.action} on CreativeVerse.`}
          onSignIn={() => {
            setToast(null);
            navigate('/signin');
          }}
          onDismiss={() => setToast(null)}
        />
      )}

      {toastMsg && (
        <div
          style={{
            position: 'absolute',
            bottom: 96,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1100,
            animation: 'toastSlideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            whiteSpace: 'nowrap',
          }}
        >
          <style>{`
            @keyframes toastSlideUp {
              from { opacity: 0; transform: translateX(-50%) translateY(20px) scale(0.92); }
              to   { opacity: 1; transform: translateX(-50%) translateY(0)    scale(1);    }
            }
          `}</style>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '11px 18px 11px 12px',
              borderRadius: 100,
              background: 'rgba(18, 22, 32, 0.88)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 4px 32px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.06) inset',
            }}
          >
            {/* Check circle */}
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 0 12px rgba(52, 211, 153, 0.4)',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M2.5 6.5L5.5 9.5L10.5 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Text */}
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#F1F5F9',
                letterSpacing: 0.1,
              }}
            >
              {toastMsg}
            </span>
          </div>
        </div>
      )}

      {isEditing && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(11, 13, 18, 0.96)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            padding: '24px 20px',
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingTop: 'env(safe-area-inset-top, 0px)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>Edit Profile</h2>
            <button
              onClick={() => setIsEditing(false)}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              X
            </button>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ position: 'relative', width: 80, height: 80 }}>
                <img
                  src={editAvatar || AVATAR}
                  alt="Avatar Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #FF7A59',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <label
                  style={{
                    padding: '6px 14px',
                    borderRadius: 100,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: '#FFF',
                  }}
                >
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleImageChange(event, setEditAvatar)}
                    style={{ display: 'none' }}
                  />
                </label>

                {editAvatar && (
                  <button
                    type="button"
                    onClick={() => setEditAvatar('')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 100,
                      background: 'rgba(255, 74, 74, 0.1)',
                      border: '1px solid rgba(255, 74, 74, 0.2)',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#FF4A4A',
                      cursor: 'pointer',
                    }}
                  >
                    Delete Photo
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div
                style={{
                  width: '100%',
                  height: 84,
                  borderRadius: 18,
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(15, 23, 42, 0.72)',
                }}
              >
                <img
                  src={editBanner || BANNER}
                  alt="Banner Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <label
                style={{
                  padding: '6px 14px',
                  borderRadius: 100,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#FFF',
                  alignSelf: 'center',
                }}
              >
                Upload Banner
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleImageChange(event, setEditBanner)}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#B8C0CC', textTransform: 'uppercase' }}>Email</label>
              <input type="email" value={editEmail} onChange={(event) => setEditEmail(event.target.value)} required style={fieldStyle} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#B8C0CC', textTransform: 'uppercase' }}>Username</label>
              <input type="text" value={editUsername} onChange={(event) => setEditUsername(event.target.value)} required style={fieldStyle} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#B8C0CC', textTransform: 'uppercase' }}>Full Name</label>
              <input type="text" value={editName} onChange={(event) => setEditName(event.target.value)} required style={fieldStyle} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#B8C0CC', textTransform: 'uppercase' }}>Professional Headline</label>
              <input type="text" value={editHeadline} onChange={(event) => setEditHeadline(event.target.value)} placeholder="Gameplay Programmer · 3D Artist" style={fieldStyle} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#B8C0CC', textTransform: 'uppercase' }}>Skills (comma-separated)</label>
              <input type="text" value={editSkills} onChange={(event) => setEditSkills(event.target.value)} placeholder="Unity, C#, Blender" style={fieldStyle} />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#FFF',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                style={{
                  flex: 1.5,
                  height: 48,
                  borderRadius: 12,
                  background: '#FF7A59',
                  border: 'none',
                  color: '#FFF',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  opacity: isSaving ? 0.7 : 1,
                }}
              >
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
