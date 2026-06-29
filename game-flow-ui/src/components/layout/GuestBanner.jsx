/**
 * GuestBanner — shown at the top of screens when user is a guest.
 * Props:
 *   onSignIn: () => void
 */
const GuestBanner = ({ onSignIn }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'linear-gradient(135deg, #1a1040, #24243e)',
    padding: '12px 16px',
    gap: 10,
    flexShrink: 0,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 16 }}>👁️</span>
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 500, lineHeight: 1.4 }}>
        Browsing as <strong style={{ color: '#fff' }}>Guest</strong> — limited access
      </span>
    </div>
    <button
      onClick={onSignIn}
      style={{
        background: 'linear-gradient(135deg, #ff7e7e, #ff9a6e)',
        color: '#fff',
        border: 'none',
        borderRadius: 20,
        padding: '7px 14px',
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 12px rgba(255,126,126,0.4)',
        flexShrink: 0,
      }}
    >
      Sign In ↗
    </button>
  </div>
);

export default GuestBanner;
