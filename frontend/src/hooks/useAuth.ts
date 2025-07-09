import { useState, useEffect } from 'react';
import { AuthState, LoginCredentials } from '../types';
import { authService } from '../services/auth';
import { getSocket } from '../socket';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Try to get current user with existing token
          const user = await authService.getCurrentUser();
          setAuthState({
            user,
            token,
            isAuthenticated: true
          });
        } else {
          // Try to refresh token using cookie
          try {
            const { token: newToken } = await authService.refreshToken();
            const user = await authService.getCurrentUser();
            localStorage.setItem('token', newToken);
            setAuthState({
              user,
              token: newToken,
              isAuthenticated: true
            });
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (refreshError) {
            // No valid session, user needs to login
            setAuthState({
              user: null,
              token: null,
              isAuthenticated: false
            });
          }
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        localStorage.removeItem('token');
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false
        });
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const { user, token } = await authService.login(credentials);

    localStorage.setItem('token', token);
    setAuthState({
      user,
      token,
      isAuthenticated: true,
    });

    const socket = getSocket();
    socket.connect();
    socket.emit('register_user', user.id.toString());
  };


  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Continue with logout even if server call fails
    } finally {
      localStorage.removeItem('token');
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false
      });
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const { token } = await authService.refreshToken();
      localStorage.setItem('token', token);
      setAuthState(prev => ({ ...prev, token }));
    } catch (error) {
      await logout();
      throw error;
    }
  };

  return {
    ...authState,
    loading,
    login,
    logout,
    refreshToken
  };
};