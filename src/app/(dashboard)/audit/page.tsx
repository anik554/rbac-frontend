'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/lib/api/services';
import { PERMISSION_ATOMS } from '@/config/permissions';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Spinner, EmptyState } from '@/components/ui';
import { Input } from '@/components/ui/input';
import { timeAgo, formatDate } from '@/lib/utils';
import { FileText, Search, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AuditLog } from '@/types';

const ACTION_COLORS: Record<string, string> = {
  'auth.login':           'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  'auth.logout':          'bg-slate-500/15 text-slate-400 border-slate-500/20',
  'user.created':         'bg-blue-500/15 text-blue-300 border-blue-500/20',
  'user.deleted':         'bg-red-500/15 text-red-300 border-red-500/20',
  'user.status.suspended':'bg-yellow-500/15 text-yellow-300 border-yellow-500/20',
  'user.status.banned':   'bg-red-500/15 text-red-300 border-red-500/20',
  'permissions.granted':  'bg-purple-500/15 text-purple-300 border-purple-500/20',
  'permissions.revoked':  'bg-orange-500/15 text-orange-300 border-orange-500/20',
};

export default function AuditPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [resource, setResource] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['audit', page, search, resource],
    queryFn: () => auditApi.list({ page, limit: 20, search: search || undefined, resource: resource || undefined })
      .then((r) => r.data.data),
  });

  const logs: AuditLog[] = data?.data || [];
  const meta = data?.meta;

  return (
    <AuthGuard requiredPermission={PERMISSION_ATOMS.AUDIT_VIEW}>
      <div className="space-y-5">
        <div className="animate-fadeInUp">
          <h2 className="text-xl font-bold text-white">Audit Log</h2>
          <p className="text-sm text-slate-400 mt-0.5">Append-only record of all platform activity.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 animate-fadeInUp delay-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input placeholder="Search logs..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <select value={resource} onChange={(e) => { setResource(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-slate-800/60 border border-slate-700 text-slate-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500 cursor-pointer">
            <option value="">All resources</option>
            {['user','session','lead','task','permission'].map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
          </select>
          {meta && <div className="flex items-center text-sm text-slate-400 px-2">{meta.total} total</div>}
        </div>

        {/* Log list */}
        <div className="glass-card overflow-hidden animate-fadeInUp delay-200">
          {isLoading ? (
            <div className="flex justify-center p-16"><Spinner /></div>
          ) : logs.length === 0 ? (
            <EmptyState icon={<FileText className="w-6 h-6" />} title="No audit logs" description="No activity has been recorded yet." />
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {logs.map((log) => {
                const colorClass = ACTION_COLORS[log.action] || 'bg-slate-500/15 text-slate-400 border-slate-500/20';
                return (
                  <div key={log.id} className="flex items-start gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${colorClass} border`}>
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-md border ${colorClass}`}>{log.action}</span>
                        <span className="text-xs text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-md">{log.resource}</span>
                      </div>
                      <p className="text-sm text-slate-300 mt-1.5">{log.description}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                        {log.actor && <span>{log.actor.firstName} {log.actor.lastName} &lt;{log.actor.email}&gt;</span>}
                        {log.ipAddress && <span>· {log.ipAddress}</span>}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-slate-400">{timeAgo(log.createdAt)}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{formatDate(log.createdAt, 'MMM d, HH:mm')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {meta && meta.pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06]">
              <span className="text-xs text-slate-400">Page {meta.page} of {meta.pages}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage((p) => Math.min(meta.pages, p + 1))} disabled={page >= meta.pages}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
