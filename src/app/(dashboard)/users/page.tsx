'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usersApi } from '@/lib/api/services';
import { useAuthStore } from '@/lib/store/auth.store';
import { PERMISSION_ATOMS } from '@/config/permissions';
import { AuthGuard } from '@/components/auth/auth-guard';
import { toast } from '@/components/ui/toaster';
import {
  Badge, Modal, ConfirmDialog, Avatar, EmptyState, SkeletonRow, Select, Card,
} from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROLE_COLORS, STATUS_COLORS, getErrorMessage, formatDate } from '@/lib/utils';
import {
  Plus, Search, UserX, UserCheck, Trash2, Edit, Users,
  Filter, MoreHorizontal, ShieldAlert,
} from 'lucide-react';
import type { User, RoleType } from '@/types';

const createSchema = z.object({
  firstName: z.string().min(1),
  lastName:  z.string().min(1),
  email:     z.string().email(),
  password:  z.string().min(8),
  role:      z.enum(['admin','manager','agent','customer'] as const),
  phone:     z.string().optional(),
});
type CreateForm = z.infer<typeof createSchema>;

export default function UsersPage() {
  const qc = useQueryClient();
  const { hasPermission } = useAuthStore();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', search, roleFilter, statusFilter],
    queryFn: () => usersApi.list({ search: search || undefined, role: roleFilter || undefined, status: statusFilter || undefined })
      .then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateForm) => usersApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setShowCreate(false); toast('success', 'User created successfully'); },
    onError: (e) => toast('error', 'Failed to create user', getErrorMessage(e)),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => usersApi.updateStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast('success', 'User status updated'); },
    onError: (e) => toast('error', 'Failed to update status', getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast('success', 'User deleted'); },
    onError: (e) => toast('error', 'Failed to delete user', getErrorMessage(e)),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateForm>({ resolver: zodResolver(createSchema) });

  return (
    <AuthGuard requiredPermission={PERMISSION_ATOMS.USERS_VIEW}>
      <div className="space-y-5">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeInUp">
          <div>
            <h2 className="text-xl font-bold text-white">User Management</h2>
            <p className="text-sm text-slate-400 mt-0.5">{users.length} users</p>
          </div>
          {hasPermission(PERMISSION_ATOMS.USERS_CREATE) && (
            <Button onClick={() => setShowCreate(true)} leftIcon={<Plus className="w-4 h-4" />}>
              New User
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 animate-fadeInUp delay-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-800/60 border border-slate-700 text-slate-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="">All roles</option>
            {['admin','manager','agent','customer'].map((r) => (
              <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-800/60 border border-slate-700 text-slate-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="">All statuses</option>
            {['active','suspended','banned'].map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden animate-fadeInUp delay-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['User', 'Role', 'Status', 'Manager', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
                  : users.length === 0
                  ? (
                    <tr><td colSpan={6} className="px-6 py-16">
                      <EmptyState icon={<Users className="w-6 h-6" />} title="No users found" description="Create your first user to get started." />
                    </td></tr>
                  )
                  : users.map((user: User) => (
                    <tr key={user.id} className="table-row-hover">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={`${user.firstName} ${user.lastName}`} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={ROLE_COLORS[user.role.name as RoleType]}>
                          {user.role.name}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[user.status]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : user.status === 'suspended' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {user.manager ? `${user.manager.firstName} ${user.manager.lastName}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">{formatDate(user.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {hasPermission(PERMISSION_ATOMS.USERS_SUSPEND) && user.status === 'active' && (
                            <button
                              onClick={() => statusMutation.mutate({ id: user.id, status: 'suspended' })}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/10 transition-all"
                              title="Suspend"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                          {hasPermission(PERMISSION_ATOMS.USERS_SUSPEND) && user.status === 'suspended' && (
                            <button
                              onClick={() => statusMutation.mutate({ id: user.id, status: 'active' })}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 transition-all"
                              title="Reactivate"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                          {hasPermission(PERMISSION_ATOMS.USERS_DELETE) && (
                            <button
                              onClick={() => setDeleteId(user.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* Create user modal */}
        <Modal open={showCreate} onClose={() => { setShowCreate(false); reset(); }} title="Create New User" size="md">
          <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First name" error={errors.firstName?.message} {...register('firstName')} />
              <Input label="Last name" error={errors.lastName?.message} {...register('lastName')} />
            </div>
            <Input label="Email address" type="email" error={errors.email?.message} {...register('email')} />
            <Input label="Password" type="password" error={errors.password?.message} {...register('password')} />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Role"
                error={errors.role?.message}
                options={[
                  { value: 'manager', label: 'Manager' },
                  { value: 'agent', label: 'Agent' },
                  { value: 'customer', label: 'Customer' },
                  { value: 'admin', label: 'Admin' },
                ]}
                placeholder="Select role"
                {...register('role')}
              />
              <Input label="Phone (optional)" {...register('phone')} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" type="button" onClick={() => { setShowCreate(false); reset(); }}>Cancel</Button>
              <Button type="submit" loading={createMutation.isPending}>Create User</Button>
            </div>
          </form>
        </Modal>

        {/* Delete confirm */}
        <ConfirmDialog
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
          title="Delete User"
          description="This action is permanent and cannot be undone. Are you sure?"
          danger
        />
      </div>
    </AuthGuard>
  );
}
