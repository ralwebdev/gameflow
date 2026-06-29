import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        background: '#0B0D12',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
      }}
    >
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 28,
          padding: '48px 32px',
          maxWidth: 360,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 900, color: '#FF7A59', letterSpacing: -2, lineHeight: 1 }}>
          404
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Lost in the Verse?</h1>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
            The page you are looking for doesn't exist or has been moved to a new coordinate.
          </p>
        </div>
        <button
          onClick={() => navigate('/app/home')}
          style={{
            height: 50,
            padding: '0 24px',
            borderRadius: 14,
            border: 'none',
            background: '#FF7A59',
            color: '#FFFFFF',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 16px rgba(255, 122, 89, 0.3)',
          }}
        >
          Go Back Home
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
