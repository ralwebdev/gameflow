import { useEffect, useState } from 'react';

/**
 * GuestToast — transient bottom toast shown when guest taps a locked action.
 * Props:
 *   message: string
 *   onSignIn: () => void
 *   onDismiss: () => void
 */
const GuestToast = ({ message, onSignIn, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const t1 = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss after 3.5s
    const t2 = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDismiss]);

  return (
    <div style={{
      position: 'fixed',
      bottom: 90,
      left: '50%',
      transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`,
      opacity: visible ? 1 : 0,
      transition: 'all 0.3s cubic-bezier(.34,1.56,.64,1)',
      zIndex: 9999,
      width: 'calc(100% - 40px)',
      maxWidth: 390,
      background: '#1a1040',
      border: '1px solid rgba(156,92,255,0.4)',
      borderRadius: 18,
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
    }}>
      <span style={{ fontSize: 22, flexShrink: 0 }}>🔒</span>
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', flex: 1, fontWeight: 500, lineHeight: 1.4 }}>
        {message}
      </span>
      <button
        onClick={onSignIn}
        style={{
          background: 'linear-gradient(135deg, #ff7e7e, #ff9a6e)',
          color: '#fff', border: 'none',
          borderRadius: 12, padding: '8px 14px',
          fontSize: 12, fontWeight: 700,
          cursor: 'pointer', whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        Sign In
      </button>
    </div>
  );
};

export default GuestToast;
