import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { AuthGuard } from '@/components/auth/auth-guard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen" style={{ background: 'var(--surface-0)' }}>
        <Sidebar />
        <Header />
        <main
          className="min-h-screen"
          style={{ marginLeft: '260px', paddingTop: '64px' }}
        >
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
