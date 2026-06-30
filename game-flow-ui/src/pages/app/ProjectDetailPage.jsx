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
  ChevronLeftIcon, ExpandIcon, HeartIcon,
  CommentIcon, BookmarkIcon, ShareIcon, VerifiedIcon,
} from '../../components/icons/Icons';

/* ─── Sub-components ─────────────────────────────────── */

const ActionButton = ({ icon, label, bg, onClick, locked }) => (
  <button
    onClick={onClick}
    style={{
      flex: 1,
      height: 52,
      background: bg,
      border: 'none',
      borderRadius: 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      fontSize: 14,
      fontWeight: 700,
      color: '#1a1a2e',
      cursor: 'pointer',
      outline: 'none',
      position: 'relative',
    }}
  >
    {icon}
    {label}
    {locked && <span style={{ position: 'absolute', top: 4, right: 6, fontSize: 10 }}>🔒</span>}
  </button>
);

/* ─── Fallback Data ───────────────────────────────────── */
const AVATAR = 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/19f781f2a-1e76-4c62-8f73-55c5248d45ab.png';
const BANNER = 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/1bd8db8c4-7446-4905-bbe6-106a3bce5dc2.png';

const formatCount = (value = 0) => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }

  return String(value);
};

const ProjectDetailPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { isGuest, user, token } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [toast, setToast] = useState(null);
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
          setShowComments(false);
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
    if (!updatedContent) {
      return;
    }

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
        : updatedContent,
    );
  };

  const mutateEngagement = async (action, payload = {}) => {
    if (isGuest) {
      const actionLabel =
        action === 'comment'
          ? 'comment on posts'
          : action === 'react'
            ? 'react to posts'
            : action === 'save'
              ? 'save posts'
              : 'share posts';
      handleGuestAction(actionLabel);
      return;
    }

    if (action === 'react') {
      const previous = engagement;
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
      } catch (error) {
        syncProject({ engagement: previous });
        throw error;
      }

      return;
    }

    if (action === 'save') {
      const previous = engagement;
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
      } catch (error) {
        syncProject({ engagement: previous });
        throw error;
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
    const shareUrl = window.location.href;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch {
      window.prompt('Copy this link', shareUrl);
    }

    if (!isGuest) {
      await mutateEngagement('share');
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();

    if (!commentText.trim()) {
      return;
    }

    setIsSubmittingComment(true);
    const previous = engagement;
    try {
      const optimisticComment = {
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
          comments: [optimisticComment, ...comments],
        },
      });

      const result = await createPostComment(token, projectId, { text: commentText.trim() });
      syncProject({ engagement: result.engagement });
      setCommentText('');
      setShowComments(true);
    } catch (err) {
      syncProject({ engagement: previous });
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

    if (!text || !text.trim()) {
      return;
    }

    try {
      const result = await createCommentReply(token, commentId, { text: text.trim() });
      syncProject({ engagement: result.engagement });
      setShowComments(true);
    } catch (error) {
      alert(error.message || 'Failed to add reply.');
    }
  };

  const renderCommentThread = (comment, depth = 0) => (
    <div
      key={comment.commentId}
      style={{
        padding: '12px 14px',
        borderRadius: 16,
        background: '#f6f7fb',
        border: '1px solid rgba(26,26,46,0.08)',
        marginLeft: depth > 0 ? 18 : 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <img
          src={comment.avatar || AVATAR}
          alt={comment.username || comment.name || 'commenter'}
          style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
        />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>
            {comment.username || comment.name || 'CreativeVerse member'}
          </div>
          <div style={{ fontSize: 11, color: '#7a7a8e' }}>
            {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : 'Just now'}
          </div>
        </div>
      </div>
      <p style={{ margin: '0 0 8px', fontSize: 14, color: '#4b4b62', lineHeight: 1.5 }}>
        {comment.text}
      </p>
      <button
        type="button"
        onClick={() => handleReply(comment.commentId)}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          color: '#7a7a8e',
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Reply
      </button>

      {(comment.replies ?? []).length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
          {comment.replies.map((reply) => renderCommentThread(reply, depth + 1))}
        </div>
      ) : null}
    </div>
  );

  if (loading) {
    return (
      <div className="mobile-frame" style={{ width: '100%', height: '100vh', background: '#0B0D12', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Loading Project...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="mobile-frame" style={{ width: '100%', height: '100vh', background: '#0B0D12', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>{error || 'Project not found.'}</div>
        <button onClick={() => navigate(-1)} style={{ padding: '8px 16px', background: '#FF7A59', border: 'none', borderRadius: 8, color: '#FFF', fontWeight: 600, cursor: 'pointer' }}>Go Back</button>
      </div>
    );
  }

  const imageSrc = project.previewUrl || project.imageUrl || BANNER;
  const creatorRole = project.type === 'game' ? 'Game Developer' : project.type === '3d' ? '3D Artist' : '2D Artist';

  return (
    <div
      className="mobile-frame anim-fade-up"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        background: '#0B0D12',
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
          paddingBottom: 100,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {/* Guest banner */}
        {isGuest && <GuestBanner onSignIn={() => navigate('/signin')} />}

        {/* Top viewer panel */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(180deg, #2a1a5e 0%, #3d2a7a 30%, #4a3590 60%, #5a45a0 100%)',
          paddingTop: 20, paddingBottom: 40,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          minHeight: 460, flexShrink: 0,
        }}>
          <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 5 }}>
            <button className="icon-btn icon-btn--light" aria-label="Back" onClick={() => navigate(-1)}>
              <ChevronLeftIcon size={22} />
            </button>
            <button className="icon-btn icon-btn--light" aria-label="Expand">
              <ExpandIcon size={20} />
            </button>
          </div>

          <div style={{ marginTop: 30, width: '100%', height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              <div style={{ width: '75%', aspectRatio: '3/4', borderRadius: 8, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,.4)' }}>
                <img src={imageSrc} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            )}
          </div>

          {project.type === '3d' && (
            <div style={{ marginTop: 24, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600, background: 'rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: 100, backdropFilter: 'blur(10px)' }}>
              Drag to orbit · Pinch to zoom
            </div>
          )}
        </div>

        {/* Info bottom drawer */}
        <div style={{
          background: '#FFFFFF',
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          padding: '24px 20px 40px',
          marginTop: -20, position: 'relative', zIndex: 3,
          boxShadow: '0 -10px 30px rgba(0,0,0,.15)',
        }}>
          {/* Creator tag */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => {
              if (user && project.ownerUsername === user.username) {
                navigate('/app/profile');
              } else {
                navigate(`/app/creator/${project.ownerUsername || 'creator'}`);
              }
            }}>
              <img src={(user && project.ownerUsername === user.username && user.avatar) ? user.avatar : (project.ownerAvatar || AVATAR)} alt={project.ownerUsername || 'creator'} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {project.ownerUsername || 'creator'}
                  <VerifiedIcon />
                </div>
                <div style={{ fontSize: 11, color: '#7a7a8e', fontWeight: 500 }}>{creatorRole}</div>
              </div>
            </div>
            <button className="btn btn--primary-sm" style={{ padding: '8px 16px', opacity: isGuest ? 0.7 : 1 }} onClick={guard('follow creators', () => {})}>
              Follow {isGuest && '🔒'}
            </button>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: '0 0 8px', letterSpacing: -0.3 }}>
            {project.title}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {Array.isArray(project.tags) && project.tags.map(t => (
              <span key={t} style={{ fontSize: 13, fontWeight: 600, color: '#9c5cff' }}>#{t}</span>
            ))}
          </div>

          <p style={{ fontSize: 14, color: '#6b6b80', lineHeight: 1.6, margin: '0 0 24px' }}>
            {project.description || 'No description provided.'}
          </p>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <ActionButton
              icon={<HeartIcon filled={liked} size={26} />}
              label={formatCount(engagement.likesCount)} bg="#ffeef0"
              locked={isGuest}
              onClick={() => mutateEngagement('react')}
            />
            <ActionButton icon={<CommentIcon size={26} />} label={formatCount(engagement.commentsCount)} bg="#f5f5f7"
              locked={isGuest}
              onClick={() => setShowComments((prev) => !prev)}
            />
            <ActionButton
              icon={<BookmarkIcon filled={saved} size={26} />}
              label={formatCount(engagement.savesCount)} bg="#fff8e6"
              locked={isGuest}
              onClick={() => mutateEngagement('save')}
            />
            <ActionButton
              icon={<ShareIcon size={26} />}
              label={formatCount(engagement.sharesCount)} bg="#f5f5f7"
              onClick={handleShare}
            />
          </div>

          {showComments && (
            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', color: '#7a7a8e' }}>
                Comments
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 260, overflowY: 'auto' }}>
                {comments.length > 0 ? comments.map((comment) => renderCommentThread(comment)) : (
                  <div style={{ fontSize: 14, color: '#7a7a8e' }}>
                    No comments yet. Be the first to respond.
                  </div>
                )}
              </div>

              <form onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <textarea
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  rows={4}
                  placeholder={isGuest ? 'Sign in to comment on this post.' : 'Write a comment...'}
                  disabled={isGuest || isSubmittingComment}
                  style={{
                    width: '100%',
                    borderRadius: 16,
                    border: '1px solid rgba(26,26,46,0.08)',
                    background: '#fff',
                    color: '#1a1a2e',
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
                  style={{ opacity: isGuest || isSubmittingComment || !commentText.trim() ? 0.65 : 1, alignSelf: 'flex-start' }}
                >
                  {isSubmittingComment ? 'Posting...' : isGuest ? 'Sign in to comment' : 'Post Comment'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Guest toast */}
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
