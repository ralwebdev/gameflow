import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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

/* ─── Data ───────────────────────────────────────────── */

const MODEL_IMG = 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/1bd8db8c4-7446-4905-bbe6-106a3bce5dc2.png';

const ProjectDetailPage = () => {
  const navigate = useNavigate();
  const { isGuest } = useAuth();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(null);

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

        {/* Top 3D viewer panel */}
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

          <div style={{ marginTop: 30, width: '75%', aspectRatio: '3/4', borderRadius: 8, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,.4)' }}>
            <img src={MODEL_IMG} alt="Mech Unit X-9" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>

          <div style={{ marginTop: 24, fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600, background: 'rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: 100, backdropFilter: 'blur(10px)' }}>
            Drag to orbit · Pinch to zoom
          </div>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/app/creator/alex_vfx')}>
              <img src="https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/19f781f2a-1e76-4c62-8f73-55c5248d45ab.png" alt="alex_vfx" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: 4 }}>
                  alex_vfx
                  <VerifiedIcon />
                </div>
                <div style={{ fontSize: 11, color: '#7a7a8e', fontWeight: 500 }}>VFX Artist</div>
              </div>
            </div>
            <button className="btn btn--primary-sm" style={{ padding: '8px 16px', opacity: isGuest ? 0.7 : 1 }} onClick={guard('follow creators', () => {})}>
              Follow {isGuest && '🔒'}
            </button>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: '0 0 8px', letterSpacing: -0.3 }}>
            Volumetric Portal Effect
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {['#vfx', '#ue5', '#realtime', '#simulation'].map(t => (
              <span key={t} style={{ fontSize: 13, fontWeight: 600, color: '#9c5cff' }}>{t}</span>
            ))}
          </div>

          <p style={{ fontSize: 14, color: '#6b6b80', lineHeight: 1.6, margin: '0 0 24px' }}>
            Real-time volumetric portal simulation in Unreal Engine 5.2. Testing Niagara fluids combined with custom HLSL raymarching shaders for deep cinematic layering.
          </p>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <ActionButton
              icon={<HeartIcon filled={liked} size={26} />}
              label="12.4K" bg="#ffeef0"
              locked={isGuest}
              onClick={guard('Like posts', () => setLiked(!liked))}
            />
            <ActionButton icon={<CommentIcon size={26} />} label="412" bg="#f5f5f7"
              locked={isGuest}
              onClick={guard('comment on posts', () => {})}
            />
            <ActionButton
              icon={<BookmarkIcon filled={saved} size={26} />}
              label="1.2K" bg="#fff8e6"
              locked={isGuest}
              onClick={guard('save posts', () => setSaved(!saved))}
            />
            <ActionButton icon={<ShareIcon size={26} />} label="Share" bg="#f5f5f7" onClick={() => alert('Link copied!')} />
          </div>
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
