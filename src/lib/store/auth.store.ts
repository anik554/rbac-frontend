'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/types';
import { setAccessToken, setRefreshMeta, clearTokens } from '@/lib/api/client';
import { authApi } from '@/lib/api/services';
import { PERMISSION_ATOMS } from '@/config/permissions';

const mapUserPermissions = (userData: any): AuthUser => {
  if (!userData) return userData;

  if (userData.role?.name === 'admin') {
    userData.permissions = Object.values(PERMISSION_ATOMS);
    return userData;
  }

  const rolePerms = Array.isArray(userData.role?.permissions)
    ? userData.role.permissions.map((p: any) => typeof p === 'string' ? p : p.atom)
    : [];
  const extraPerms = Array.isArray(userData.extraPermissions)
    ? userData.extraPermissions.map((p: any) => typeof p === 'string' ? p : p.atom)
    : [];
  const directPerms = Array.isArray(userData.permissions) ? userData.permissions : [];

  userData.permissions = Array.from(new Set([...rolePerms, ...extraPerms, ...directPerms])).filter(Boolean);
  return userData as AuthUser;
};

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  hasPermission: (atom: string) => boolean;
  hasAnyPermission: (atoms: string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login({ email, password });
          const { accessToken, refreshToken, user: rawUser } = data.data;
          const user = mapUserPermissions(rawUser);
          setAccessToken(accessToken);
          setRefreshMeta(user.id, refreshToken);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try { await authApi.logout(); } catch { }
        clearTokens();
        set({ user: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          const { data } = await authApi.me();
          const user = mapUserPermissions(data.data);
          set({ user, isAuthenticated: true });
        } catch {
          clearTokens();
          set({ user: null, isAuthenticated: false });
        }
      },

      hasPermission: (atom) => {
        const { user } = get();
        if (user?.role?.name === 'admin') return true;
        return user?.permissions?.includes(atom) ?? false;
      },

      hasAnyPermission: (atoms) => {
        const { user } = get();
        if (user?.role?.name === 'admin') return true;
        return atoms.some((a) => user?.permissions?.includes(a) ?? false);
      },
    }),
    {
      name: 'rbac-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
