import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const isOnboardingCompleted = localStorage.getItem('cv_onboarding_completed') === 'true';

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return isOnboardingCompleted ? <Navigate to="/signin" replace /> : <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
