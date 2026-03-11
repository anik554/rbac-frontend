'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/lib/store/auth.store';
import { authApi } from '@/lib/api/services';
import { PERMISSION_ATOMS } from '@/config/permissions';
import { AuthGuard } from '@/components/auth/auth-guard';
import { toast } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getErrorMessage } from '@/lib/utils';
import { Shield, Key, User, Bell } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm<{
    currentPassword: string; newPassword: string; confirmPassword: string;
  }>();

  const newPw = watch('newPassword');

  const onChangePassword = async (data: any) => {
    setLoading(true);
    try {
      await authApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast('success', 'Password changed', 'Please log in again with your new password.');
      reset();
    } catch (e) {
      toast('error', 'Failed', getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard requiredPermission={PERMISSION_ATOMS.SETTINGS_VIEW}>
      <div className="space-y-6 max-w-2xl">
        <div className="animate-fadeInUp">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <p className="text-sm text-slate-400 mt-0.5">Manage your account and preferences.</p>
        </div>

        {/* Profile */}
        <div className="glass-card p-6 space-y-4 animate-fadeInUp delay-100">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-white">Profile Information</h3>
          </div>
          <div className="flex items-center gap-4 pb-4 border-b border-white/[0.06]">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <p className="text-base font-semibold text-white">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-slate-400">{user?.email}</p>
              <span className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 capitalize">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />{user?.role?.name}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">First Name</p>
              <p className="text-sm text-white">{user?.firstName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Last Name</p>
              <p className="text-sm text-white">{user?.lastName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Email</p>
              <p className="text-sm text-white">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Phone</p>
              <p className="text-sm text-white">{user?.phone || '—'}</p>
            </div>
          </div>
        </div>

        {/* Change password */}
        <div className="glass-card p-6 animate-fadeInUp delay-200">
          <div className="flex items-center gap-2 mb-5">
            <Key className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-semibold text-white">Change Password</h3>
          </div>
          <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
            <Input label="Current Password" type="password" {...register('currentPassword', { required: 'Required' })} error={errors.currentPassword?.message} />
            <Input label="New Password" type="password" {...register('newPassword', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })} error={errors.newPassword?.message} />
            <Input label="Confirm New Password" type="password"
              {...register('confirmPassword', {
                required: 'Required',
                validate: (v) => v === newPw || 'Passwords do not match',
              })}
              error={errors.confirmPassword?.message}
            />
            <div className="flex justify-end pt-2">
              <Button type="submit" loading={loading}>Update Password</Button>
            </div>
          </form>
        </div>

        {/* Permissions summary */}
        <div className="glass-card p-6 animate-fadeInUp delay-300">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-semibold text-white">My Permissions</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {(user?.permissions || []).map((p) => (
              <span key={p} className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-300">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
