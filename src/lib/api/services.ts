import api from './client';
import type {
  AuthUser, LoginCredentials, User, CreateUserPayload, UpdateUserPayload,
  Permission, UserPermissions, Lead, CreateLeadPayload, Task, CreateTaskPayload,
  AuditLog, PaginatedResponse, DashboardStats, ApiResponse,
} from '@/types';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (data: LoginCredentials) =>
    api.post<ApiResponse<{ accessToken: string; refreshToken: string; user: AuthUser }>>('/auth/login', data),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<ApiResponse<AuthUser>>('/auth/me'),

  refresh: (userId: string, refreshToken: string) =>
    api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', { userId, refreshToken }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const usersApi = {
  list: (params?: { role?: string; status?: string; search?: string; managerId?: string }) =>
    api.get<ApiResponse<User[]>>('/users', { params }),

  get: (id: string) => api.get<ApiResponse<User>>(`/users/${id}`),

  create: (data: CreateUserPayload) => api.post<ApiResponse<User>>('/users', data),

  update: (id: string, data: UpdateUserPayload) =>
    api.patch<ApiResponse<User>>(`/users/${id}`, data),

  updateStatus: (id: string, status: string) =>
    api.patch(`/users/${id}/status`, { status }),

  delete: (id: string) => api.delete(`/users/${id}`),
};

// ─── Permissions ─────────────────────────────────────────────────────────────
export const permissionsApi = {
  listAll: () => api.get<ApiResponse<Permission[]>>('/permissions'),

  getUserPermissions: (userId: string) =>
    api.get<ApiResponse<UserPermissions>>(`/permissions/users/${userId}`),

  grant: (targetUserId: string, atoms: string[]) =>
    api.post('/permissions/grant', { targetUserId, atoms }),

  revoke: (targetUserId: string, atoms: string[]) =>
    api.post('/permissions/revoke', { targetUserId, atoms }),

  setUserPermissions: (userId: string, atoms: string[]) =>
    api.patch(`/permissions/users/${userId}`, { atoms }),
};

// ─── Leads ───────────────────────────────────────────────────────────────────
export const leadsApi = {
  list: () => api.get<ApiResponse<Lead[]>>('/leads'),
  get: (id: string) => api.get<ApiResponse<Lead>>(`/leads/${id}`),
  create: (data: CreateLeadPayload) => api.post<ApiResponse<Lead>>('/leads', data),
  update: (id: string, data: Partial<CreateLeadPayload> & { status?: string }) =>
    api.patch<ApiResponse<Lead>>(`/leads/${id}`, data),
  delete: (id: string) => api.delete(`/leads/${id}`),
};

// ─── Tasks ───────────────────────────────────────────────────────────────────
export const tasksApi = {
  list: () => api.get<ApiResponse<Task[]>>('/tasks'),
  get: (id: string) => api.get<ApiResponse<Task>>(`/tasks/${id}`),
  create: (data: CreateTaskPayload) => api.post<ApiResponse<Task>>('/tasks', data),
  update: (id: string, data: Partial<CreateTaskPayload> & { status?: string }) =>
    api.patch<ApiResponse<Task>>(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

// ─── Reports ─────────────────────────────────────────────────────────────────
export const reportsApi = {
  summary: () => api.get('/reports/summary'),
};

// ─── Audit ───────────────────────────────────────────────────────────────────
export const auditApi = {
  list: (params?: {
    page?: number; limit?: number; actorId?: string;
    resource?: string; action?: string; from?: string; to?: string; search?: string;
  }) => api.get<ApiResponse<PaginatedResponse<AuditLog>>>('/audit', { params }),
};

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const dashboardApi = {
  stats: () => api.get<ApiResponse<DashboardStats>>('/dashboard/stats'),
};
