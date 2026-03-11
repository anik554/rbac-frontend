'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { leadsApi, usersApi } from '@/lib/api/services';
import { PERMISSION_ATOMS } from '@/config/permissions';
import { AuthGuard } from '@/components/auth/auth-guard';
import { useAuthStore } from '@/lib/store/auth.store';
import { toast } from '@/components/ui/toaster';
import { Modal, ConfirmDialog, EmptyState, SkeletonRow, Badge } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LEAD_STATUS_COLORS, formatDate, getErrorMessage } from '@/lib/utils';
import { Plus, Target, Trash2, Edit2 } from 'lucide-react';
import type { Lead } from '@/types';

const STATUS_OPTIONS = ['new','contacted','qualified','lost','converted'].map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }));

export default function LeadsPage() {
  const qc = useQueryClient();
  const { hasPermission } = useAuthStore();
  const [showCreate, setShowCreate] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => leadsApi.list().then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => leadsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['leads'] }); setShowCreate(false); toast('success', 'Lead created'); },
    onError: (e) => toast('error', 'Failed', getErrorMessage(e)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => leadsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['leads'] }); setEditLead(null); toast('success', 'Lead updated'); },
    onError: (e) => toast('error', 'Failed', getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => leadsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['leads'] }); toast('success', 'Lead deleted'); },
    onError: (e) => toast('error', 'Failed', getErrorMessage(e)),
  });

  const { register, handleSubmit, reset } = useForm();

  const LeadForm = ({ onSubmit, loading, defaultValues }: any) => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Name *" defaultValue={defaultValues?.name} {...register('name', { required: true })} />
        <Input label="Company" defaultValue={defaultValues?.company} {...register('company')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Email" type="email" defaultValue={defaultValues?.email} {...register('email')} />
        <Input label="Phone" defaultValue={defaultValues?.phone} {...register('phone')} />
      </div>
      {defaultValues && (
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Status</label>
          <select defaultValue={defaultValues.status} {...register('status')}
            className="w-full bg-slate-800/60 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500">
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Notes</label>
        <textarea defaultValue={defaultValues?.notes} {...register('notes')}
          rows={3}
          className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 resize-none"
          placeholder="Additional notes..."
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" type="button" onClick={() => { setShowCreate(false); setEditLead(null); reset(); }}>Cancel</Button>
        <Button type="submit" loading={loading}>{defaultValues ? 'Save Changes' : 'Create Lead'}</Button>
      </div>
    </form>
  );

  return (
    <AuthGuard requiredPermission={PERMISSION_ATOMS.LEADS_VIEW}>
      <div className="space-y-5">
        <div className="flex items-center justify-between animate-fadeInUp">
          <div>
            <h2 className="text-xl font-bold text-white">Leads</h2>
            <p className="text-sm text-slate-400 mt-0.5">{leads.length} leads in pipeline</p>
          </div>
          {hasPermission(PERMISSION_ATOMS.LEADS_CREATE) && (
            <Button onClick={() => setShowCreate(true)} leftIcon={<Plus className="w-4 h-4" />}>New Lead</Button>
          )}
        </div>

        <div className="glass-card overflow-hidden animate-fadeInUp delay-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Name', 'Company', 'Contact', 'Status', 'Assigned To', 'Created', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
                  : leads.length === 0
                  ? <tr><td colSpan={7}><EmptyState icon={<Target className="w-6 h-6" />} title="No leads yet" description="Add your first lead to start tracking." /></td></tr>
                  : leads.map((lead: Lead) => (
                    <tr key={lead.id} className="table-row-hover">
                      <td className="px-6 py-4 text-sm font-medium text-white">{lead.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{lead.company || '—'}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-300">{lead.email || '—'}</p>
                        <p className="text-xs text-slate-500">{lead.phone || ''}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${LEAD_STATUS_COLORS[lead.status]}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {lead.assignedTo ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">{formatDate(lead.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {hasPermission(PERMISSION_ATOMS.LEADS_EDIT) && (
                            <button onClick={() => setEditLead(lead)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 transition-all">
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {hasPermission(PERMISSION_ATOMS.LEADS_DELETE) && (
                            <button onClick={() => setDeleteId(lead.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all">
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

        <Modal open={showCreate} onClose={() => { setShowCreate(false); reset(); }} title="New Lead">
          <LeadForm onSubmit={(data: any) => createMutation.mutate(data)} loading={createMutation.isPending} />
        </Modal>

        <Modal open={!!editLead} onClose={() => { setEditLead(null); reset(); }} title="Edit Lead">
          {editLead && <LeadForm onSubmit={(data: any) => updateMutation.mutate({ id: editLead.id, data })} loading={updateMutation.isPending} defaultValues={editLead} />}
        </Modal>

        <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} title="Delete Lead" description="Are you sure you want to delete this lead?" danger />
      </div>
    </AuthGuard>
  );
}
