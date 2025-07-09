import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Track ongoing refresh token request to prevent duplicates
let refreshTokenPromise: Promise<string> | null = null;

// Decode JWT to check expiration
const decodeJWT = (token: string) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

// Check if token is expired or about to expire (within 5 minutes)
const isTokenExpiringSoon = (token: string) => {
  const decoded = decodeJWT(token);
  if (!decoded?.exp) return false;
  
  const now = Date.now() / 1000;
  const buffer = 300; // 5 minutes in seconds
  return decoded.exp - now < buffer;
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor to add token + proactive refresh
apiClient.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Refresh token if expiring soon (proactive refresh)
      if (isTokenExpiringSoon(token)) {
        try {
          const newToken = await refreshTokenIfNeeded();
          config.headers.Authorization = `Bearer ${newToken}`;
        } catch (error) {
          // If refresh fails, proceed with original token
          console.error('Proactive refresh failed:', error);
          config.headers.Authorization = `Bearer ${token}`;
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (handles 401 errors + retries)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Only handle 401 errors + avoid infinite retries
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await refreshTokenIfNeeded();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear token and redirect
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Centralized token refresh logic
async function refreshTokenIfNeeded(): Promise<string> {
  // Return ongoing refresh request if one exists
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  try {
    refreshTokenPromise = axios
      .post(`${API_BASE_URL}/api/auth/refresh-token`, {}, { withCredentials: true })
      .then((response) => {
        const newToken = response.data.accessToken || response.data.token;
        localStorage.setItem('token', newToken);
        return newToken;
      })
      .finally(() => {
        refreshTokenPromise = null; // Reset after completion
      });

    return await refreshTokenPromise;
  } catch (error) {
    refreshTokenPromise = null;
    throw error;
  }
}

export default apiClient;