'use client';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api/services';
import { PERMISSION_ATOMS } from '@/config/permissions';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Spinner } from '@/components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart2, Trophy, TrendingUp } from 'lucide-react';

const COLORS = ['#6366F1','#10B981','#F59E0B','#EF4444','#8B5CF6'];

export default function ReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['reports-summary'],
    queryFn: () => reportsApi.summary().then((r) => r.data.data),
  });
  return (
    <AuthGuard requiredPermission={PERMISSION_ATOMS.REPORTS_VIEW}>
      <div className="space-y-6">
        <div className="animate-fadeInUp">
          <h2 className="text-xl font-bold text-white">Reports</h2>
          <p className="text-sm text-slate-400 mt-0.5">Platform-wide analytics and performance metrics.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-24"><Spinner size="lg" /></div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {/* Leads by status */}
              <div className="glass-card p-6 animate-fadeInUp delay-100">
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-semibold text-white">Leads by Status</h3>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={(data?.data?.leads?.byStatus || []).map((d: any) => ({ name: d.status, count: parseInt(d.count) }))} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                    <Bar dataKey="count" radius={[6,6,0,0]}>
                      {(data?.data?.leads?.byStatus || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Tasks by status */}
              <div className="glass-card p-6 animate-fadeInUp delay-200">
                <div className="flex items-center gap-2 mb-5">
                  <BarChart2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-semibold text-white">Tasks by Status</h3>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={(data?.data?.tasks?.byStatus || []).map((d: any) => ({ name: d.status.replace('_',' '), value: parseInt(d.count) }))}
                      cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value"
                    >
                      {(data?.data?.tasks?.byStatus || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                    <Legend formatter={(v) => <span style={{ color: '#94A3B8', fontSize: 12 }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top agents */}
            <div className="glass-card p-6 animate-fadeInUp delay-300">
              <div className="flex items-center gap-2 mb-5">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-semibold text-white">Top Agents by Leads</h3>
              </div>
              <div className="space-y-3">
                {(data?.data?.topAgents || []).map((agent: any, i: number) => (
                  <div key={agent.agentId} className="flex items-center gap-4">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-500/20 text-amber-300' : i === 1 ? 'bg-slate-500/20 text-slate-300' : 'bg-orange-500/20 text-orange-300'}`}>
                      #{i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">{agent.firstName} {agent.lastName}</span>
                        <span className="text-sm font-bold text-indigo-400">{agent.leadsCount}</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                          style={{ width: `${Math.min(100, (agent.leadsCount / ((data?.topAgents[0]?.leadsCount) || 1)) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
                {(!data?.data?.topAgents || data?.data?.topAgents.length === 0) && (
                  <p className="text-sm text-slate-500 text-center py-8">No data available</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
