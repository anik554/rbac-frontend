'use client';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/services';
import { useAuthStore } from '@/lib/store/auth.store';
import { timeAgo } from '@/lib/utils';
import { PERMISSION_ATOMS } from '@/config/permissions';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Spinner, Avatar } from '@/components/ui';
import {
  Users, Target, CheckSquare, TrendingUp, Activity,
  ArrowUpRight, ArrowDownRight, UserCheck, UserX,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const STAT_CARDS = [
  { key: 'totalUsers',    label: 'Total Users',    icon: Users,       color: 'indigo', sub: 'all roles' },
  { key: 'activeUsers',   label: 'Active Users',   icon: UserCheck,   color: 'emerald', sub: 'currently active' },
  { key: 'totalLeads',    label: 'Total Leads',    icon: Target,      color: 'purple', sub: 'in pipeline' },
  { key: 'totalTasks',    label: 'Total Tasks',    icon: CheckSquare, color: 'amber', sub: 'assigned tasks' },
];

const COLOR_MAP: Record<string, string> = {
  indigo: '#6366F1', emerald: '#10B981', purple: '#8B5CF6', amber: '#F59E0B',
};

const PIE_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.stats().then((r) => r.data.data),
    refetchInterval: 30_000,
  });

  const stats = [
    { key: 'totalUsers',  value: data?.users.total ?? 0 },
    { key: 'activeUsers', value: data?.users.active ?? 0 },
    { key: 'totalLeads',  value: data?.leads.total ?? 0 },
    { key: 'totalTasks',  value: data?.tasks.total ?? 0 },
  ];

  const pieData = data ? [
    { name: 'Active',    value: data.users.active },
    { name: 'Suspended', value: data.users.suspended },
    { name: 'Leads',     value: data.leads.total },
    { name: 'Tasks',     value: data.tasks.total },
  ] : [];

  return (
    <AuthGuard requiredPermission={PERMISSION_ATOMS.DASHBOARD_VIEW}>
      <div className="space-y-6">
        {/* Welcome */}
        <div className="animate-fadeInUp">
          <h2 className="text-2xl font-bold text-white">
            Hello, {user?.firstName}! 👋
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Here&apos;s what&apos;s happening across your platform today.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {STAT_CARDS.map((card, i) => {
            const stat = stats.find((s) => s.key === card.key);
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                className={`glass-card p-5 animate-fadeInUp delay-${(i + 1) * 100}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${COLOR_MAP[card.color]}20`, border: `1px solid ${COLOR_MAP[card.color]}30` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: COLOR_MAP[card.color] }} />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {isLoading ? <span className="skeleton inline-block w-12 h-8 rounded" /> : stat?.value ?? 0}
                </p>
                <p className="text-sm font-medium text-white">{card.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{card.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* User breakdown */}
          <div className="glass-card p-6 xl:col-span-2 animate-fadeInUp delay-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold text-white">User Status Overview</h3>
                <p className="text-xs text-slate-500 mt-0.5">Active vs suspended accounts</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">Live</span>
              </div>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center h-48"><Spinner /></div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[
                  { name: 'Active',    users: data?.users.active ?? 0 },
                  { name: 'Suspended', users: data?.users.suspended ?? 0 },
                  { name: 'Total',     users: data?.users.total ?? 0 },
                ]} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                    cursor={{ fill: 'rgba(99,102,241,0.05)' }}
                  />
                  <Bar dataKey="users" fill="#6366F1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie */}
          <div className="glass-card p-6 animate-fadeInUp delay-300">
            <h3 className="text-base font-semibold text-white mb-6">Platform Breakdown</h3>
            {isLoading ? (
              <div className="flex items-center justify-center h-48"><Spinner /></div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 space-y-2">
                  {pieData.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                        <span className="text-slate-400">{item.name}</span>
                      </div>
                      <span className="font-semibold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="glass-card p-6 animate-fadeInUp delay-400">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-semibold text-white">Recent Activity</h3>
            </div>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton h-12 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {(data?.recentActivity || []).slice(0, 8).map((log) => (
                <div key={log.id} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/[0.03] transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <Activity className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{log.description || log.action}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : 'System'}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 flex-shrink-0">{timeAgo(log.createdAt)}</span>
                </div>
              ))}
              {(!data?.recentActivity || data.recentActivity.length === 0) && (
                <p className="text-sm text-slate-500 text-center py-8">No recent activity</p>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
