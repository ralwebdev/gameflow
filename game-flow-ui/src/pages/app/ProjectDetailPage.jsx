import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  createCommentReply,
  createPostComment,
  fetchProject,
  togglePostLike,
  togglePostSave,
  updateContentEngagement,
} from '../../lib/content';
import GltfAssetViewer from '../../components/GltfAssetViewer';
import WebGLGamePlayer from '../../components/WebGLGamePlayer';
import GuestBanner from '../../components/layout/GuestBanner';
import GuestToast from '../../components/layout/GuestToast';
import {
  ChevronLeftIcon, HeartIcon,
  CommentIcon, BookmarkIcon, ShareIcon, VerifiedIcon,
} from '../../components/icons/Icons';

/* ─── Design Tokens ────────────────────────────────────────────────────── */
const C = {
  bg: '#090909',
  surface: '#121212',
  surfaceGlass: 'rgba(20, 20, 20, 0.7)',
  cardGlass: 'rgba(255, 255, 255, 0.03)',
  borderGlass: 'rgba(255, 255, 255, 0.08)',
  text: '#F5F5F7',
  textSecondary: '#A1A1AA',
  accent: '#FF7A5C',
  accentGrad: 'linear-gradient(135deg, #FF7A5C 0%, #E65C40 100%)',
  purple: '#A855F7',
  pink: '#EC4899',
  success: '#34D399',
};

const formatCount = (value = 0) => {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
};

const AVATAR = 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/19f781f2a-1e76-4c62-8f73-55c5248d45ab.png';
const BANNER = 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/1bd8db8c4-7446-4905-bbe6-106a3bce5dc2.png';

/* ─── Premium Glass Badge ──────────────────────────────────────────────── */
const GlassBadge = ({ children }) => (
  <span style={{
    padding: '6px 12px',
    borderRadius: 100,
    background: 'rgba(255, 255, 255, 0.06)',
    border: `1px solid ${C.borderGlass}`,
    color: '#FFF',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  }}>
    {children}
  </span>
);

/* ─── Premium Glass Chip ───────────────────────────────────────────────── */
const GlassChip = ({ children, accent }) => (
  <span style={{
    padding: '6px 12px',
    borderRadius: 8,
    background: accent ? 'rgba(255, 122, 92, 0.1)' : 'rgba(255, 255, 255, 0.03)',
    border: `1px solid ${accent ? 'rgba(255, 122, 92, 0.2)' : C.borderGlass}`,
    color: accent ? C.accent : C.textSecondary,
    fontSize: 12,
    fontWeight: 500,
    transition: 'all 0.2s',
  }}>
    {children}
  </span>
);

/* ─── ProjectDetailPage Component ──────────────────────────────────────── */
const ProjectDetailPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { isGuest, user, token } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [toast, setToast] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [collaborated, setCollaborated] = useState(false);

  const localIdRef = useRef(0);
  const nextLocalId = () => {
    localIdRef.current += 1;
    return `local-${localIdRef.current}`;
  };

  useEffect(() => {
    let isMounted = true;
    async function getProjectData() {
      setLoading(true);
      try {
        const data = await fetchProject(projectId, token);
        if (isMounted && data?.project) {
          setProject(data.project);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load project details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    getProjectData();
    return () => {
      isMounted = false;
    };
  }, [projectId, token]);

  const handleGuestAction = (actionName) => {
    setToast({ action: actionName });
  };

  const guard = (actionName, fn) => (...args) => {
    if (isGuest) {
      handleGuestAction(actionName);
    } else {
      fn(...args);
    }
  };

  const engagement = project?.engagement ?? {};
  const comments = Array.isArray(engagement.comments) ? engagement.comments : [];
  const liked = Boolean(engagement.viewerHasLiked ?? engagement.isLiked);
  const saved = Boolean(engagement.viewerHasSaved ?? engagement.isSaved);

  const syncProject = (updatedContent) => {
    if (!updatedContent) return;
    setProject((prev) =>
      prev
        ? {
            ...prev,
            ...updatedContent,
            engagement: {
              ...(prev.engagement ?? {}),
              ...(updatedContent.engagement ?? {}),
            },
          }
        : updatedContent
    );
  };

  const mutateEngagement = async (action, payload = {}) => {
    if (isGuest) {
      const label = action === 'comment' ? 'comment on posts'
                  : action === 'react' ? 'react to posts'
                  : action === 'save' ? 'save posts' : 'share posts';
      handleGuestAction(label);
      return;
    }

    if (action === 'react') {
      const prev = engagement;
      syncProject({
        engagement: {
          ...engagement,
          viewerHasLiked: !liked,
          isLiked: !liked,
          likesCount: Math.max(0, Number(engagement.likesCount || 0) + (liked ? -1 : 1)),
        },
      });
      try {
        const result = await togglePostLike(token, projectId);
        syncProject({ engagement: result.engagement });
      } catch (err) {
        syncProject({ engagement: prev });
      }
      return;
    }

    if (action === 'save') {
      const prev = engagement;
      syncProject({
        engagement: {
          ...engagement,
          viewerHasSaved: !saved,
          isSaved: !saved,
          savesCount: Math.max(0, Number(engagement.savesCount || 0) + (saved ? -1 : 1)),
        },
      });
      try {
        const result = await togglePostSave(token, projectId);
        syncProject({ engagement: result.engagement });
      } catch (err) {
        syncProject({ engagement: prev });
      }
      return;
    }

    const result = await updateContentEngagement(token, 'project', projectId, {
      action,
      ...payload,
    });
    syncProject(result.content);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        alert('Project link copied to clipboard!');
      }
    } catch {
      window.prompt('Copy this link', url);
    }
    if (!isGuest) await mutateEngagement('share');
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    const prev = engagement;
    try {
      const optComment = {
        commentId: `optimistic-${nextLocalId()}`,
        userId: user?.id || user?._id || 'me',
        username: user?.username || 'me',
        name: user?.name || 'Me',
        avatar: user?.avatar || AVATAR,
        text: commentText.trim(),
        createdAt: new Date().toISOString(),
        replies: [],
      };
      syncProject({
        engagement: {
          ...engagement,
          commentsCount: Number(engagement.commentsCount || 0) + 1,
          comments: [optComment, ...comments],
        },
      });
      const result = await createPostComment(token, projectId, { text: commentText.trim() });
      syncProject({ engagement: result.engagement });
      setCommentText('');
    } catch (err) {
      syncProject({ engagement: prev });
      alert(err.message || 'Failed to add comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReply = async (commentId) => {
    if (isGuest) {
      handleGuestAction('reply to comments');
      return;
    }
    const text = window.prompt('Write a reply');
    if (!text || !text.trim()) return;

    try {
      const result = await createCommentReply(token, commentId, { text: text.trim() });
      syncProject({ engagement: result.engagement });
    } catch (err) {
      alert(err.message || 'Failed to add reply.');
    }
  };

  if (loading) {
    return (
      <div className="mobile-frame" style={{ width: '100%', height: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: C.textSecondary }}>Loading Immersive Space...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="mobile-frame" style={{ width: '100%', height: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 16, color: C.textSecondary }}>{error || 'Project not found.'}</div>
        <button onClick={() => navigate(-1)} style={{ padding: '10px 20px', background: C.accent, border: 'none', borderRadius: 12, color: '#FFF', fontWeight: 600, cursor: 'pointer' }}>Go Back</button>
      </div>
    );
  }

  const imageSrc = project.previewUrl || project.imageUrl || BANNER;
  const creatorRole = project.type === 'game' ? 'Game Developer' : project.type === '3d' ? '3D Artist' : '2D Artist';

  return (
    <div
      className="mobile-frame"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        background: C.bg,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: C.text,
      }}
    >
      {/* Immersive blur element */}
      <div aria-hidden style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
        background: `radial-gradient(circle at 50% 0%, ${C.accent}12, transparent 65%)`,
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── TOP NAV BAR ── */}
      <div style={{
        position: 'relative', zIndex: 10, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px',
        background: 'linear-gradient(to bottom, rgba(9,9,9,0.85) 0%, rgba(9,9,9,0) 100%)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${C.borderGlass}`,
              color: C.text, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ChevronLeftIcon size={20} />
          </button>

          <div
            onClick={() => {
              if (user && project.ownerUsername === user.username) navigate('/app/profile');
              else navigate(`/app/creator/${project.ownerUsername || 'creator'}`);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
          >
            <img
              src={(user && project.ownerUsername === user.username && user.avatar) ? user.avatar : (project.ownerAvatar || AVATAR)}
              alt="creator"
              style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, lineHeight: 1.2 }}>
                {project.ownerUsername || 'creator'}
                {((!user || project.ownerUsername !== user.username) || user.isVerified) && <VerifiedIcon size={11} />}
              </span>
              <span style={{ fontSize: 10, color: C.textSecondary }}>{creatorRole}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={guard('follow creators', () => setIsFollowing(!isFollowing))}
            style={{
              padding: '6px 14px',
              borderRadius: 100,
              background: isFollowing ? 'transparent' : C.accent,
              border: `1px solid ${isFollowing ? C.borderGlass : 'transparent'}`,
              color: '#FFF',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>
      </div>

      {/* ── SCROLLABLE BODY ── */}
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

        {/* ── IMMERSIVE MEDIA SPACE ── */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '52vh',
          background: '#040404',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderBottom: `1px solid ${C.borderGlass}`,
        }}>
          {project.type === '3d' && project.modelUrl ? (
            <GltfAssetViewer
              modelUrl={project.modelUrl}
              title={project.title}
              mode={project.mode || 'landscape'}
            />
          ) : project.type === 'game' && project.gameUrl ? (
            <WebGLGamePlayer
              gameUrl={project.gameUrl}
              title={project.title}
              mode={project.mode || 'landscape'}
              loadingScreenUrl={project.previewUrl}
            />
          ) : (
            <img
              src={imageSrc}
              alt={project.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.4s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
            />
          )}

          {/* Floating Category Badge */}
          <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 5 }}>
            <GlassBadge>{project.category || project.type}</GlassBadge>
          </div>

          {/* User Guide for 3D Viewer */}
          {project.type === '3d' && (
            <div style={{
              position: 'absolute', bottom: 16,
              background: 'rgba(9, 9, 9, 0.65)',
              border: `1px solid ${C.borderGlass}`,
              backdropFilter: 'blur(8px)',
              padding: '6px 14px',
              borderRadius: 100,
              fontSize: 11,
              color: C.textSecondary,
              fontWeight: 500,
            }}>
              Drag to orbit · Pinch to zoom
            </div>
          )}
        </div>

        {/* ── INFO & DETAILS AREA ── */}
        <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Title and stats summary */}
          <div>
            <h1 style={{
              fontSize: 26,
              fontWeight: 800,
              margin: '0 0 6px',
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
            }}>
              {project.title}
            </h1>
            <p style={{
              fontSize: 12.5,
              color: C.textSecondary,
              margin: 0,
            }}>
              Published in <span style={{ color: C.accent, fontWeight: 600 }}>{project.category || project.type}</span> · {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Recently'}
            </p>
          </div>

          {/* Expandable Description */}
          <div>
            <p style={{
              fontSize: 14,
              color: C.textSecondary,
              lineHeight: 1.6,
              margin: 0,
              maxHeight: descExpanded ? 'none' : '4.8em',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: descExpanded ? 'none' : 3,
              WebkitBoxOrient: 'vertical',
            }}>
              {project.description || 'No description provided for this artwork.'}
            </p>
            {project.description && project.description.length > 100 && (
              <button
                onClick={() => setDescExpanded(!descExpanded)}
                style={{
                  background: 'none', border: 'none', color: C.accent,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  padding: '6px 0 0',
                }}
              >
                {descExpanded ? 'Read Less' : 'Read More'}
              </button>
            )}
          </div>

          {/* Project tags */}
          {Array.isArray(project.tags) && project.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {project.tags.map(t => (
                <GlassChip key={t} accent>#{t}</GlassChip>
              ))}
            </div>
          )}

          {/* ── HORIZONTAL ACTION/ENGAGEMENT BAR ── */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: `1px solid ${C.borderGlass}`,
            borderRadius: 16,
            padding: '12px 14px',
            display: 'flex',
            justifyContent: 'space-around',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}>
            {[
              {
                icon: <HeartIcon filled={liked} size={22} color={liked ? C.accent : 'currentColor'} />,
                label: formatCount(engagement.likesCount),
                onClick: () => mutateEngagement('react'),
                active: liked,
              },
              {
                icon: <CommentIcon size={22} />,
                label: formatCount(engagement.commentsCount),
                onClick: () => setShowAllComments(!showAllComments),
              },
              {
                icon: <BookmarkIcon filled={saved} size={22} color={saved ? C.accent : 'currentColor'} />,
                label: formatCount(engagement.savesCount),
                onClick: () => mutateEngagement('save'),
                active: saved,
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
                label: 'Collab',
                onClick: guard('collaborate', () => setCollaborated(!collaborated)),
                active: collaborated,
              },
              {
                icon: <ShareIcon size={22} />,
                label: 'Share',
                onClick: handleShare,
              },
            ].map((act, i) => (
              <button
                key={i}
                onClick={act.onClick}
                style={{
                  background: 'none', border: 'none',
                  color: act.active ? C.accent : C.text,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 6, cursor: 'pointer',
                  padding: '4px 8px', transition: 'all 0.15s',
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
                onMouseUp={e => e.currentTarget.style.transform = 'none'}
              >
                {act.icon}
                <span style={{ fontSize: 11, fontWeight: 600 }}>{act.label}</span>
              </button>
            ))}
          </div>

          {/* ── PROJECT STATS GLASS CARD ── */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: `1px solid ${C.borderGlass}`,
            borderRadius: 20,
            padding: '18px 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
            textAlign: 'center',
          }}>
            {[
              { label: 'Views', value: formatCount(project.viewsCount || 1240) },
              { label: 'Likes', value: formatCount(engagement.likesCount) },
              { label: 'Comments', value: formatCount(engagement.commentsCount) },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{ fontSize: 11, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* ── COLLABORATION CTA ── */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 122, 92, 0.06) 0%, rgba(168, 85, 247, 0.04) 100%)',
            border: `1px solid rgba(255, 122, 92, 0.15)`,
            borderRadius: 20,
            padding: 22,
            textAlign: 'center',
          }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700 }}>Interested in collaborating?</h3>
            <p style={{ margin: '0 0 16px', fontSize: 12.5, color: C.textSecondary, lineHeight: 1.45 }}>
              Message the creator to coordinate asset production, dev, or custom pipelines.
            </p>
            <button
              onClick={guard('collaborate', () => { alert('Collaboration request sent!'); setCollaborated(true); })}
              style={{
                width: '100%', height: 46, borderRadius: 12,
                background: C.accentGrad, border: 'none', color: '#FFF',
                fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.08)'}
              onMouseLeave={e => e.currentTarget.style.filter = 'none'}
            >
              {collaborated ? 'Request Sent ✔' : 'Send Collaboration Request'}
            </button>
            <span style={{ display: 'block', marginTop: 8, fontSize: 10.5, color: C.textSecondary }}>
              Requests are delivered to the creator's inbox.
            </span>
          </div>

          {/* ── TOOLS USED ── */}
          {Array.isArray(project.software) && project.software.length > 0 && (
            <div>
              <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.textSecondary }}>
                Tools Used
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {project.software.map(sw => (
                  <GlassChip key={sw}>{sw}</GlassChip>
                ))}
              </div>
            </div>
          )}

          {/* ── COMMENTS PREVIEW SECTION ── */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.textSecondary }}>
                Comments ({comments.length})
              </h3>
              <button
                onClick={() => setShowAllComments(!showAllComments)}
                style={{ background: 'none', border: 'none', color: C.accent, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                {showAllComments ? 'Hide Comments' : 'View All'}
              </button>
            </div>

            {/* Comment form inside */}
            <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder={isGuest ? 'Sign in to comment' : 'Add a response...'}
                disabled={isGuest || isSubmittingComment}
                style={{
                  flex: 1, height: 42, borderRadius: 10,
                  background: C.surface, border: `1px solid ${C.borderGlass}`,
                  color: C.text, padding: '0 14px', fontSize: 13, outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || isSubmittingComment}
                style={{
                  height: 42, padding: '0 16px', borderRadius: 10,
                  background: C.accent, border: 'none', color: '#FFF',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  opacity: commentText.trim() ? 1 : 0.5,
                }}
              >
                Post
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {comments.slice(0, showAllComments ? undefined : 2).map((comment) => (
                <div key={comment.commentId} style={{
                  padding: 14, borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${C.borderGlass}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img
                        src={comment.avatar || AVATAR}
                        alt="commenter"
                        style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span style={{ fontSize: 12.5, fontWeight: 700 }}>
                        {comment.username || 'member'}
                      </span>
                    </div>
                    <span style={{ fontSize: 10.5, color: C.textSecondary }}>
                      {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13.5, color: C.textSecondary, lineHeight: 1.45 }}>
                    {comment.text}
                  </p>
                </div>
              ))}

              {comments.length === 0 && (
                <p style={{ margin: 0, fontSize: 13, color: C.textSecondary, fontStyle: 'italic' }}>
                  No responses yet. Be the first to start a conversation!
                </p>
              )}
            </div>
          </div>

          {/* ── RELATED PROJECTS ── */}
          <div>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.textSecondary }}>
              More from Creator
            </h3>
            <div
              className="scrollbar-hide"
              style={{
                display: 'flex', gap: 12, overflowX: 'auto',
                paddingBottom: 8, scrollbarWidth: 'none', msOverflowStyle: 'none',
              }}
            >
              {[
                { title: 'Cyberpunk Rigging Loop', category: 'Animation', image: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/12de9432e-ccf4-418f-a563-5181abb44ff3.png', views: '18K' },
                { title: 'Volumetric Portal Effect', category: 'VFX', image: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/1bd8db8c4-7446-4905-bbe6-106a3bce5dc2.png', views: '24K' },
                { title: 'Sci-Fi Mech Turntable', category: '3D', image: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/1a26c70d3-6e59-4426-897a-6546a2e98a7e.png', views: '32K' }
              ].map((proj, i) => (
                <div
                  key={i}
                  style={{
                    width: 150, flexShrink: 0,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${C.borderGlass}`,
                    borderRadius: 14, overflow: 'hidden',
                  }}
                >
                  <img src={proj.image} alt={proj.title} style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover' }} />
                  <div style={{ padding: 8 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {proj.title}
                    </div>
                    <div style={{ fontSize: 10.5, color: C.textSecondary }}>{proj.views} views</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CREATOR PROFILE CARD ── */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: `1px solid ${C.borderGlass}`,
            borderRadius: 20,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <img
                src={(user && project.ownerUsername === user.username && user.avatar) ? user.avatar : (project.ownerAvatar || AVATAR)}
                alt="creator"
                style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {project.ownerUsername || 'creator'}
                  {((!user || project.ownerUsername !== user.username) || user.isVerified) && <VerifiedIcon size={12} />}
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: C.textSecondary }}>
                  Verified CreativeVerse Creator
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={guard('follow', () => setIsFollowing(!isFollowing))}
                style={{
                  flex: 1, height: 38, borderRadius: 10,
                  background: isFollowing ? 'transparent' : C.accent,
                  border: `1px solid ${isFollowing ? C.borderGlass : 'transparent'}`,
                  color: '#FFF', fontWeight: 600, fontSize: 12.5, cursor: 'pointer',
                }}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button
                onClick={() => {
                  if (user && project.ownerUsername === user.username) navigate('/app/profile');
                  else navigate(`/app/creator/${project.ownerUsername || 'creator'}`);
                }}
                style={{
                  flex: 1, height: 38, borderRadius: 10,
                  background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.borderGlass}`,
                  color: C.text, fontWeight: 600, fontSize: 12.5, cursor: 'pointer',
                }}
              >
                Visit Profile
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Guest Toast Notification */}
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

export default ProjectDetailPage;
