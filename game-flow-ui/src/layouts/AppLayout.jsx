import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from '../components/navigation/BottomNav';

const AppLayout = () => {
  const { pathname } = useLocation();
  const hideBottomNav = pathname.startsWith('/app/upload');

  return (
    <div
      className="mobile-frame"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#0B0D12',
      }}
    >
      <div style={{ flex: 1, height: '100%', width: '100%', position: 'relative', overflow: 'hidden' }}>
        <Outlet />
      </div>

      {!hideBottomNav && <BottomNav />}
    </div>
  );
};

export default AppLayout;
