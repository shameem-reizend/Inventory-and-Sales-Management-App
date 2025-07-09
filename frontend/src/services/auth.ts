import axios from 'axios';
import { User, LoginCredentials } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance with credentials for cookie handling
const authClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      const response = await authClient.post('/api/auth/login', {
        email: credentials.email,
        password: credentials.password
      });
      
      const data = response.data;
      
      let user: User;
      let token: string;
      
      // Handle response with accessToken
      if (data.user && data.accessToken) {
        user = data.user;
        token = data.accessToken;
      } else if (data.user && data.token) {
        user = data.user;
        token = data.token;
      } else if (data.accessToken && data.email) {
        // If user data is flattened in response
        user = {
          id: data.id || data.userId || 'unknown',
          name: data.name || data.username || 'User',
          email: data.email,
          role: data.role || 'sales'
        };
        token = data.accessToken;
      } else if (data.token) {
        // Minimal response with just token
        user = {
          id: data.id || 'unknown',
          name: data.name || 'User',
          email: credentials.email,
          role: data.role || 'sales'
        };
        token = data.token;
      } else {
        throw new Error('Invalid response format from server');
      }
      
      return { user, token };
    } catch (error: any) {
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const errorData = error.response.data;
        
        if (status === 401) {
          throw new Error(errorData?.message || 'Invalid email or password');
        } else if (status === 400) {
          throw new Error(errorData?.message || 'Please check your email and password');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(errorData?.message || `Server error (${status})`);
        }
      } else if (error.request) {
        // Network error - no response received
        if (error.message.includes('Network Error') || error.code === 'ERR_NETWORK') {
          throw new Error(`Unable to connect to server. Please ensure your backend server is running on port 8000.`);
        }
        
        throw new Error(`Unable to connect to server at ${API_BASE_URL}. Please check if the server is running.`);
      } else {
        // Something else happened
        throw new Error(error.message || 'Login failed. Please try again.');
      }
    }
  },

  async register(userData: { name: string; email: string; password: string; role: User['role'] }): Promise<{ user: User; token: string }> {
    try {
      const response = await authClient.post('/api/auth/register', userData);
      
      const data = response.data;
      let user: User;
      let token: string;
      
      if (data.user && data.accessToken) {
        user = data.user;
        token = data.accessToken;
      } else if (data.user && data.token) {
        user = data.user;
        token = data.token;
      } else {
        throw new Error('Invalid registration response format');
      }
      
      return { user, token };
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Registration failed. Please try again.');
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      
      const response = await authClient.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Handle different response formats
      if (response.data.user) {
        return response.data.user;
      } else if (response.data.id) {
        return response.data;
      } else {
        throw new Error('Invalid user data format');
      }
    } catch (error: any) {
      throw new Error('Failed to get current user');
    }
  },

  async refreshToken(): Promise<{ token: string }> {
    try {
      const response = await authClient.post('/api/auth/refresh-token');
      
      const data = response.data;
      const token = data.accessToken || data.token;
      
      if (!token) {
        throw new Error('No token in refresh response');
      }
      
      return { token };
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Token refresh failed');
    }
  },

  async logout(): Promise<void> {
    try {
      await authClient.post('/api/auth/logout');
    } catch (error: any) {
      // Even if logout fails on server, we should clear local storage
    }
  }
};