'use client';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';
import { Bell, Search } from 'lucide-react';
import { NAV_ITEMS } from '@/config/permissions';

export function Header() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const currentPage = NAV_ITEMS.find((item) => pathname.startsWith(item.href))?.label || 'Dashboard';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <header
      className="fixed top-0 right-0 z-30 flex items-center justify-between px-8"
      style={{
        left: '260px',
        height: '64px',
        background: 'rgba(15,17,23,0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Page title */}
      <div>
        <h1 className="text-lg font-bold text-white">{currentPage}</h1>
        <p className="text-xs text-slate-500 hidden sm:block">
          {greeting}, {user?.firstName} 👋
        </p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Search trigger */}
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 border border-white/[0.06] text-slate-400 hover:text-white text-sm transition-all hover:border-indigo-500/40 hidden md:flex">
          <Search className="w-4 h-4" />
          <span className="text-xs text-slate-500">Search...</span>
          <kbd className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-500">⌘K</kbd>
        </button>

        {/* Notification bell */}
        <button className="relative w-9 h-9 rounded-xl bg-slate-800/60 border border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500/40 transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 border border-slate-900" />
        </button>

        {/* Role badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          <span className="text-xs font-medium text-indigo-300 capitalize">{user?.role?.name}</span>
        </div>
      </div>
    </header>
  );
}
