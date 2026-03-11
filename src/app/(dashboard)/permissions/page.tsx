'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, permissionsApi } from '@/lib/api/services';
import { useAuthStore } from '@/lib/store/auth.store';
import { PERMISSION_ATOMS } from '@/config/permissions';
import { AuthGuard } from '@/components/auth/auth-guard';
import { toast } from '@/components/ui/toaster';
import { Spinner, Avatar, EmptyState, Badge } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { ROLE_COLORS, getErrorMessage } from '@/lib/utils';
import { Shield, ChevronRight, Check, X, Info, Save } from 'lucide-react';
import type { User, RoleType } from '@/types';

const GROUPED_ATOMS: Record<string, string[]> = {
  Dashboard:   ['dashboard.view'],
  Users:       ['users.view','users.create','users.edit','users.suspend','users.ban','users.delete'],
  Permissions: ['permissions.view','permissions.manage'],
  Leads:       ['leads.view','leads.create','leads.edit','leads.delete'],
  Tasks:       ['tasks.view','tasks.create','tasks.edit','tasks.delete'],
  Reports:     ['reports.view','reports.export'],
  Audit:       ['audit.view'],
  Settings:    ['settings.view','settings.edit'],
};

export default function PermissionsPage() {
  const qc = useQueryClient();
  const { user: me, hasPermission } = useAuthStore();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pendingAtoms, setPendingAtoms] = useState<string[] | null>(null);

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list().then((r) => r.data.data),
  });

  const { data: userPerms, isLoading: permsLoading } = useQuery({
    queryKey: ['user-permissions', selectedUser?.id],
    queryFn: () => permissionsApi.getUserPermissions(selectedUser!.id).then((r) => r.data.data),
    enabled: !!selectedUser,
  });

  const saveMutation = useMutation({
    mutationFn: (atoms: string[]) => permissionsApi.setUserPermissions(selectedUser!.id, atoms),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-permissions', selectedUser?.id] });
      toast('success', 'Permissions saved', `Updated ${selectedUser?.firstName}'s permissions`);
      setPendingAtoms(null);
    },
    onError: (e) => toast('error', 'Failed to save', getErrorMessage(e)),
  });

  const currentAtoms = pendingAtoms ?? (userPerms?.extraPermissions || []);
  const myPerms = me?.permissions || [];

  const toggleAtom = (atom: string) => {
    if (!hasPermission(PERMISSION_ATOMS.PERMISSIONS_MANAGE)) return;
    if (!myPerms.includes(atom)) return; // grant ceiling
    const base = pendingAtoms ?? (userPerms?.extraPermissions || []);
    if (base.includes(atom)) {
      setPendingAtoms(base.filter((a) => a !== atom));
    } else {
      setPendingAtoms([...base, atom]);
    }
  };

  return (
    <AuthGuard requiredPermission={PERMISSION_ATOMS.PERMISSIONS_VIEW}>
      <div className="space-y-5">
        <div className="animate-fadeInUp">
          <h2 className="text-xl font-bold text-white">Permission Editor</h2>
          <p className="text-sm text-slate-400 mt-0.5">Grant or revoke permission atoms per user. Grant ceiling applies.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* User list */}
          <div className="glass-card p-0 overflow-hidden animate-fadeInUp delay-100">
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <p className="text-sm font-semibold text-white">Select User</p>
            </div>
            <div className="overflow-y-auto max-h-[600px]">
              {usersLoading ? (
                <div className="flex justify-center p-8"><Spinner /></div>
              ) : (
                users.filter((u: User) => u.id !== me?.id).map((user: User) => (
                  <button
                    key={user.id}
                    onClick={() => { setSelectedUser(user); setPendingAtoms(null); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.03] ${selectedUser?.id === user.id ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500' : ''}`}
                  >
                    <Avatar name={`${user.firstName} ${user.lastName}`} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <Badge className={ROLE_COLORS[user.role.name as RoleType]}>{user.role.name}</Badge>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Permission editor */}
          <div className="lg:col-span-2 space-y-4 animate-fadeInUp delay-200">
            {!selectedUser ? (
              <div className="glass-card">
                <EmptyState
                  icon={<Shield className="w-6 h-6" />}
                  title="Select a user"
                  description="Choose a user from the left panel to manage their permissions."
                />
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="glass-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={`${selectedUser.firstName} ${selectedUser.lastName}`} />
                    <div>
                      <p className="text-sm font-semibold text-white">{selectedUser.firstName} {selectedUser.lastName}</p>
                      <p className="text-xs text-slate-400">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pendingAtoms !== null && (
                      <Button
                        onClick={() => saveMutation.mutate(pendingAtoms)}
                        loading={saveMutation.isPending}
                        leftIcon={<Save className="w-4 h-4" />}
                        size="sm"
                      >
                        Save Changes
                      </Button>
                    )}
                  </div>
                </div>

                {/* Grant ceiling info */}
                <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Dimmed atoms are ones you don&apos;t hold yourself — grant ceiling prevents assigning them.</span>
                </div>

                {/* Atom groups */}
                {permsLoading ? (
                  <div className="glass-card flex justify-center p-12"><Spinner /></div>
                ) : (
                  <div className="glass-card p-5 space-y-5">
                    {Object.entries(GROUPED_ATOMS).map(([group, atoms]) => (
                      <div key={group}>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{group}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {atoms.map((atom) => {
                            const iHave = myPerms.includes(atom);
                            const isEnabled = currentAtoms.includes(atom);
                            const isRole = userPerms?.rolePermissions.includes(atom);
                            return (
                              <button
                                key={atom}
                                onClick={() => toggleAtom(atom)}
                                disabled={!iHave || !!isRole}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all border ${
                                  isRole
                                    ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300 cursor-default'
                                    : isEnabled
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15'
                                    : iHave
                                    ? 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-indigo-500/40 hover:text-white'
                                    : 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                                }`}
                              >
                                <span className="font-mono">{atom}</span>
                                <span>
                                  {isRole
                                    ? <span className="text-[10px] text-indigo-400 bg-indigo-500/20 px-1.5 py-0.5 rounded">role</span>
                                    : isEnabled
                                    ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    : <X className="w-3.5 h-3.5 text-slate-600" />
                                  }
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
