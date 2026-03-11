export const PERMISSION_ATOMS = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard.view',
  // Users
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_SUSPEND: 'users.suspend',
  USERS_BAN: 'users.ban',
  USERS_DELETE: 'users.delete',
  // Permissions
  PERMISSIONS_VIEW: 'permissions.view',
  PERMISSIONS_MANAGE: 'permissions.manage',
  // Leads
  LEADS_VIEW: 'leads.view',
  LEADS_CREATE: 'leads.create',
  LEADS_EDIT: 'leads.edit',
  LEADS_DELETE: 'leads.delete',
  // Tasks
  TASKS_VIEW: 'tasks.view',
  TASKS_CREATE: 'tasks.create',
  TASKS_EDIT: 'tasks.edit',
  TASKS_DELETE: 'tasks.delete',
  // Reports
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
  // Audit
  AUDIT_VIEW: 'audit.view',
  // Customer Portal
  CUSTOMER_PORTAL_VIEW: 'customer_portal.view',
  // Settings
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',
} as const;

/** Map of route path → required permission atom */
export const ROUTE_PERMISSIONS: Record<string, string> = {
  '/dashboard':   PERMISSION_ATOMS.DASHBOARD_VIEW,
  '/users':       PERMISSION_ATOMS.USERS_VIEW,
  '/permissions': PERMISSION_ATOMS.PERMISSIONS_VIEW,
  '/leads':       PERMISSION_ATOMS.LEADS_VIEW,
  '/tasks':       PERMISSION_ATOMS.TASKS_VIEW,
  '/reports':     PERMISSION_ATOMS.REPORTS_VIEW,
  '/audit':       PERMISSION_ATOMS.AUDIT_VIEW,
  '/settings':    PERMISSION_ATOMS.SETTINGS_VIEW,
};

export const NAV_ITEMS = [
  { label: 'Dashboard',   href: '/dashboard',   icon: 'LayoutDashboard', permission: PERMISSION_ATOMS.DASHBOARD_VIEW },
  { label: 'Users',       href: '/users',        icon: 'Users',           permission: PERMISSION_ATOMS.USERS_VIEW },
  { label: 'Permissions', href: '/permissions',  icon: 'Shield',          permission: PERMISSION_ATOMS.PERMISSIONS_VIEW },
  { label: 'Leads',       href: '/leads',        icon: 'Target',          permission: PERMISSION_ATOMS.LEADS_VIEW },
  { label: 'Tasks',       href: '/tasks',        icon: 'CheckSquare',     permission: PERMISSION_ATOMS.TASKS_VIEW },
  { label: 'Reports',     href: '/reports',      icon: 'BarChart2',       permission: PERMISSION_ATOMS.REPORTS_VIEW },
  { label: 'Audit Log',   href: '/audit',        icon: 'FileText',        permission: PERMISSION_ATOMS.AUDIT_VIEW },
  { label: 'Settings',    href: '/settings',     icon: 'Settings',        permission: PERMISSION_ATOMS.SETTINGS_VIEW },
];
