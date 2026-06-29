import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Outlet />
    </div>
  );
};

export default AuthLayout;
