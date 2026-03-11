'use client';
import { useRouter } from 'next/navigation';
import { ShieldX, ArrowLeft } from 'lucide-react';

export default function ForbiddenPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface-0)' }}>
      <div className="text-center space-y-6 animate-fadeInUp">
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
          <ShieldX className="w-10 h-10 text-red-400" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">403</h1>
          <p className="text-lg font-semibold text-slate-300 mb-1">Access Denied</p>
          <p className="text-sm text-slate-500">You don&apos;t have the required permission to view this page.</p>
        </div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back
        </button>
      </div>
    </div>
  );
}
