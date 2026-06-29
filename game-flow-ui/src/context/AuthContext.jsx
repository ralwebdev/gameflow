import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('cv_auth_state') === 'authenticated';
  });
  const [isGuest, setIsGuest] = useState(() => {
    return localStorage.getItem('cv_auth_role') === 'guest';
  });

  const login = (role = 'creator') => {
    setIsAuthenticated(true);
    setIsGuest(role === 'guest');
    localStorage.setItem('cv_auth_state', 'authenticated');
    localStorage.setItem('cv_auth_role', role);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsGuest(false);
    localStorage.removeItem('cv_auth_state');
    localStorage.removeItem('cv_auth_role');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isGuest, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
