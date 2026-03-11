'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';
import { getAccessToken } from '@/lib/api/client';
import { Spinner } from '@/components/ui';

export function AuthGuard({ children, requiredPermission }: {
  children: React.ReactNode;
  requiredPermission?: string;
}) {
  const router = useRouter();
  const { isAuthenticated, user, fetchMe, hasPermission } = useAuthStore();

  useEffect(() => {
    const token = getAccessToken();
    if (!token && !isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (!user && token) {
      fetchMe();
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: 'var(--surface-0)' }}>
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    router.replace('/403');
    return null;
  }

  return <>{children}</>;
}
