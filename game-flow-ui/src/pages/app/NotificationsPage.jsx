import { BellIcon, HeartIcon, VerifiedIcon } from '../../components/icons/Icons';

const NOTIFICATIONS = [
  {
    id: 1,
    type: 'like',
    user: 'alex_vfx',
    action: 'liked your project',
    target: 'Volumetric Portal Effect',
    time: '2h ago',
    avatar: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/19f781f2a-1e76-4c62-8f73-55c5248d45ab.png',
  },
  {
    id: 2,
    type: 'follow',
    user: 'zara_neon',
    action: 'started following you',
    time: '5h ago',
    avatar: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/19f781f2a-1e76-4c62-8f73-55c5248d45ab.png',
    isVerified: true,
  },
  {
    id: 3,
    type: 'feature',
    user: 'CreativeVerse',
    action: 'featured your artwork in Trending Projects!',
    target: 'Neon Cube Composition',
    time: '1d ago',
    avatar: 'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/16f5b8c4e-7f3a-4b6d-9c8e-2d4a5e6f7a8b.png',
  },
];

const NotificationsPage = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#0B0D12',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '24px 20px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <BellIcon size={24} style={{ color: '#FF7A59' }} />
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: -0.4 }}>
          Notifications
        </h1>
      </header>

      {/* Notifications List */}
      <div
        className="scrollbar-hide"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px 100px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {NOTIFICATIONS.map((notif) => (
          <div
            key={notif.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 18,
              border: '1px solid rgba(255, 255, 255, 0.04)',
              transition: 'transform 0.15s ease',
            }}
          >
            {/* Avatar */}
            <div style={{ position: 'relative', width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
              <img src={notif.avatar} alt={notif.user} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Message Body */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ fontSize: 14, lineHeight: 1.4, color: '#E2E8F0' }}>
                <span style={{ fontWeight: 700, color: '#FFF' }}>
                  {notif.user}
                </span>{' '}
                {notif.isVerified && <VerifiedIcon style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }} />}
                {notif.action}{' '}
                {notif.target && (
                  <span style={{ fontWeight: 600, color: '#FF7A59' }}>
                    "{notif.target}"
                  </span>
                )}
              </div>
              <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.35)', fontWeight: 500 }}>
                {notif.time}
              </span>
            </div>

            {/* Type Indicator Icon */}
            <div style={{ flexShrink: 0 }}>
              {notif.type === 'like' && <HeartIcon filled size={16} style={{ color: '#FF7A59' }} />}
              {notif.type === 'follow' && <span style={{ fontSize: 14 }}>👤</span>}
              {notif.type === 'feature' && <span style={{ fontSize: 14 }}>✨</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
