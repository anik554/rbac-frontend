// ─── Enums ───────────────────────────────────────────────────────────────────
export type RoleType = 'admin' | 'manager' | 'agent' | 'customer';
export type UserStatus = 'active' | 'suspended' | 'banned';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'lost' | 'converted';
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: { id: string; name: RoleType };
  status: UserStatus;
  phone?: string;
  avatarUrl?: string;
  permissions: string[];
  createdAt: string;
}

// ─── Users ───────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: { id: string; name: RoleType };
  status: UserStatus;
  phone?: string;
  avatarUrl?: string;
  manager?: { id: string; firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: RoleType;
  phone?: string;
  managerId?: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
}

// ─── Permissions ─────────────────────────────────────────────────────────────
export interface Permission {
  id: string;
  atom: string;
  resource: string;
  action: string;
  description?: string;
}

export interface UserPermissions {
  userId: string;
  rolePermissions: string[];
  extraPermissions: string[];
  resolved: string[];
}

// ─── Leads ───────────────────────────────────────────────────────────────────
export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status: LeadStatus;
  notes?: string;
  assignedTo?: { id: string; firstName: string; lastName: string };
  createdBy?: { id: string; firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadPayload {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  assignedToId?: string;
}

// ─── Tasks ───────────────────────────────────────────────────────────────────
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assignedTo?: { id: string; firstName: string; lastName: string };
  createdBy?: { id: string; firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  assignedToId?: string;
}

// ─── Audit ───────────────────────────────────────────────────────────────────
export interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  actorId?: string;
  actor?: { id: string; firstName: string; lastName: string; email: string };
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; pages: number };
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export interface DashboardStats {
  users: { total: number; active: number; suspended: number };
  leads: { total: number };
  tasks: { total: number };
  recentActivity: AuditLog[];
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}
