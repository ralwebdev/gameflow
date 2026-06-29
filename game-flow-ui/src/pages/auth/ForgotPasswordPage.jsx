import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import wavingVideo from '../../assets/wave.mp4';
import logoImg from '../../assets/logo.jpg';

const T = {
  bg:           '#0B0D12',
  inputBg:      'rgba(15,23,42,0.65)',
  inputBorder:  'rgba(255,255,255,0.08)',
  inputFocus:   '#FF7A59',
  textPrimary:  '#FFFFFF',
  textMuted:    'rgba(255,255,255,0.5)',
  ctaBg:        '#F8F9FA',
  ctaText:      '#111827',
  font:         '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
};

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <div
      className="mobile-frame"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        background: T.bg,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: T.font,
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* ── Background Video ── */}
      <video
        src={wavingVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
      />

      {/* ── Vignette ── */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,13,18,0.6)', zIndex: 2 }} />

      {/* ── Content Container ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '40px 24px 48px',
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={logoImg} alt="CreativeVerse" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(255,255,255,0.2)' }} />
            <span style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: -0.4 }}>CreativeVerse</span>
          </div>
        </div>

        {/* Card Form */}
        <div
          style={{
            background: 'rgba(15,23,42,0.45)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 28,
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
          }}
        >
          {!submitted ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: T.textPrimary, letterSpacing: -0.5 }}>
                  Reset Password
                </h1>
                <p style={{ margin: 0, fontSize: 14, color: T.textMuted, lineHeight: 1.4 }}>
                  Enter your email address and we'll send you recovery instructions.
                </p>
              </div>

              {/* Email Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                  Email Address
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 56,
                    background: T.inputBg,
                    border: `1px solid ${focused ? T.inputFocus : T.inputBorder}`,
                    borderRadius: 16,
                    padding: '0 18px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="you@example.com"
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: 16,
                      color: T.textPrimary,
                      fontFamily: T.font,
                    }}
                  />
                </div>
              </div>

              {/* CTA button */}
              <button
                type="submit"
                disabled={!email.trim()}
                style={{
                  height: 56,
                  borderRadius: 16,
                  border: 'none',
                  background: email.trim() ? T.ctaBg : 'rgba(255,255,255,0.05)',
                  color: email.trim() ? T.ctaText : 'rgba(255,255,255,0.25)',
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: email.trim() ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                }}
              >
                Send Instructions
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(52,168,83,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34A853" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: T.textPrimary }}>Check your email</h1>
                <p style={{ margin: 0, fontSize: 14, color: T.textMuted, lineHeight: 1.5 }}>
                  We've sent recovery instructions to <strong style={{ color: '#fff' }}>{email}</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Back to Sign In */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => navigate('/signin')}
            style={{
              background: 'none',
              border: 'none',
              padding: 12,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              color: T.textPrimary,
              textDecoration: 'underline',
              textDecorationColor: 'rgba(255,255,255,0.3)',
              fontFamily: T.font,
            }}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
