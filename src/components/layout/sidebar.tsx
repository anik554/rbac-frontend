'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';
import { NAV_ITEMS } from '@/config/permissions';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Shield, Target, CheckSquare,
  BarChart2, FileText, Settings, LogOut, ChevronRight,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="w-[18px] h-[18px]" />,
  Users:           <Users className="w-[18px] h-[18px]" />,
  Shield:          <Shield className="w-[18px] h-[18px]" />,
  Target:          <Target className="w-[18px] h-[18px]" />,
  CheckSquare:     <CheckSquare className="w-[18px] h-[18px]" />,
  BarChart2:       <BarChart2 className="w-[18px] h-[18px]" />,
  FileText:        <FileText className="w-[18px] h-[18px]" />,
  Settings:        <Settings className="w-[18px] h-[18px]" />,
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, hasPermission, logout } = useAuthStore();

  // Build nav dynamically — only show items user has permission for
  const visibleItems = NAV_ITEMS.filter((item) => hasPermission(item.permission));

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : '??';

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] flex flex-col z-40"
      style={{ background: 'var(--surface-1)', borderRight: '1px solid var(--surface-border)' }}>

      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-900/50">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-tight">RBAC Platform</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Digital Pylot</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-3">
          Navigation
        </p>
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                'border-l-2 border-transparent',
                isActive
                  ? 'active text-indigo-300 bg-indigo-500/10 border-l-indigo-500'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] hover:border-l-slate-600'
              )}
            >
              <span className={cn('transition-colors', isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300')}>
                {ICON_MAP[item.icon]}
              </span>
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-400 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[10px] text-slate-500 capitalize">{user?.role?.name}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
