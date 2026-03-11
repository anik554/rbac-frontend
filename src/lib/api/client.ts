import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// ─── Token helpers ────────────────────────────────────────────────────────────
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('accessToken');
};

export const setAccessToken = (token: string) => {
  if (typeof window !== 'undefined') sessionStorage.setItem('accessToken', token);
};

export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('accessToken');
    localStorage.removeItem('refreshMeta');
  }
};

export const getRefreshMeta = (): { userId: string; refreshToken: string } | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('refreshMeta');
  return raw ? JSON.parse(raw) : null;
};

export const setRefreshMeta = (userId: string, refreshToken: string) => {
  if (typeof window !== 'undefined')
    localStorage.setItem('refreshMeta', JSON.stringify({ userId, refreshToken }));
};

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor — attach access token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401, refresh token
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const meta = getRefreshMeta();
        if (!meta) throw new Error('No refresh token');
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, meta);
        const newToken = data.data.accessToken;
        setAccessToken(newToken);
        setRefreshMeta(meta.userId, data.data.refreshToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
