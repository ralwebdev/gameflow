import { createContext, useContext, useEffect, useState } from 'react';
import {
  clearStoredSession,
  fetchCurrentUser,
  getStoredGuestState,
  getStoredToken,
  getStoredUser,
  persistAuthSession,
  persistGuestSession,
  signIn as signInRequest,
  signUp as signUpRequest,
} from '../lib/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(getStoredToken() || getStoredGuestState());
  });
  const [isGuest, setIsGuest] = useState(() => getStoredGuestState());
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getStoredToken());
  const [isLoading, setIsLoading] = useState(() => Boolean(getStoredToken()));

  useEffect(() => {
    let isMounted = true;

    async function hydrateUser() {
      const storedToken = getStoredToken();

      if (!storedToken) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const data = await fetchCurrentUser(storedToken);

        if (!isMounted) {
          return;
        }

        persistAuthSession({ token: storedToken, user: data.user });
        setUser(data.user);
        setToken(storedToken);
        setIsAuthenticated(true);
        setIsGuest(false);
      } catch {
        if (!isMounted) {
          return;
        }

        clearStoredSession();
        setUser(null);
        setToken('');
        setIsAuthenticated(false);
        setIsGuest(false);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    hydrateUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const loginGuest = () => {
    persistGuestSession();
    setUser(null);
    setToken('');
    setIsAuthenticated(true);
    setIsGuest(true);
    setIsLoading(false);
  };

  const signIn = async (credentials) => {
    const data = await signInRequest(credentials);

    persistAuthSession(data);
    setUser(data.user);
    setToken(data.token);
    setIsAuthenticated(true);
    setIsGuest(false);
    setIsLoading(false);

    return data.user;
  };

  const signUp = async (input) => {
    const data = await signUpRequest(input);

    persistAuthSession(data);
    setUser(data.user);
    setToken(data.token);
    setIsAuthenticated(true);
    setIsGuest(false);
    setIsLoading(false);

    return data.user;
  };

  const logout = () => {
    clearStoredSession();
    setUser(null);
    setToken('');
    setIsAuthenticated(false);
    setIsGuest(false);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isGuest,
        isLoading,
        user,
        token,
        loginGuest,
        signIn,
        signUp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
