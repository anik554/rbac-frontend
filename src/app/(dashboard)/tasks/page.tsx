'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { tasksApi } from '@/lib/api/services';
import { PERMISSION_ATOMS } from '@/config/permissions';
import { AuthGuard } from '@/components/auth/auth-guard';
import { useAuthStore } from '@/lib/store/auth.store';
import { toast } from '@/components/ui/toaster';
import { Modal, ConfirmDialog, EmptyState, SkeletonRow } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TASK_STATUS_COLORS, PRIORITY_COLORS, formatDate, getErrorMessage } from '@/lib/utils';
import { Plus, CheckSquare, Trash2, Edit2, Calendar } from 'lucide-react';
import type { Task } from '@/types';

export default function TasksPage() {
  const qc = useQueryClient();
  const { hasPermission } = useAuthStore();
  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.list().then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => tasksApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); setShowCreate(false); toast('success', 'Task created'); },
    onError: (e) => toast('error', 'Failed', getErrorMessage(e)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => tasksApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); setEditTask(null); toast('success', 'Task updated'); },
    onError: (e) => toast('error', 'Failed', getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); toast('success', 'Task deleted'); },
  });

  const { register, handleSubmit, reset } = useForm();

  const TaskForm = ({ onSubmit, loading, defaultValues }: any) => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Title *" defaultValue={defaultValues?.title} {...register('title', { required: true })} />
      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Description</label>
        <textarea defaultValue={defaultValues?.description} {...register('description')} rows={3}
          className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 resize-none"
          placeholder="Task description..." />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Priority</label>
          <select defaultValue={defaultValues?.priority || 'medium'} {...register('priority')}
            className="w-full bg-slate-800/60 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500">
            {['low','medium','high'].map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
          </select>
        </div>
        {defaultValues && (
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Status</label>
            <select defaultValue={defaultValues.status} {...register('status')}
              className="w-full bg-slate-800/60 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500">
              {['todo','in_progress','done','cancelled'].map((s) => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
            </select>
          </div>
        )}
      </div>
      <Input label="Due Date" type="datetime-local" defaultValue={defaultValues?.dueDate?.slice(0,16)} {...register('dueDate')} />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" type="button" onClick={() => { setShowCreate(false); setEditTask(null); reset(); }}>Cancel</Button>
        <Button type="submit" loading={loading}>{defaultValues ? 'Save' : 'Create Task'}</Button>
      </div>
    </form>
  );

  return (
    <AuthGuard requiredPermission={PERMISSION_ATOMS.TASKS_VIEW}>
      <div className="space-y-5">
        <div className="flex items-center justify-between animate-fadeInUp">
          <div>
            <h2 className="text-xl font-bold text-white">Tasks</h2>
            <p className="text-sm text-slate-400 mt-0.5">{tasks.length} tasks</p>
          </div>
          {hasPermission(PERMISSION_ATOMS.TASKS_CREATE) && (
            <Button onClick={() => setShowCreate(true)} leftIcon={<Plus className="w-4 h-4" />}>New Task</Button>
          )}
        </div>

        <div className="glass-card overflow-hidden animate-fadeInUp delay-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Title', 'Priority', 'Status', 'Assigned To', 'Due Date', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
                  : tasks.length === 0
                  ? <tr><td colSpan={6}><EmptyState icon={<CheckSquare className="w-6 h-6" />} title="No tasks yet" description="Create your first task." /></td></tr>
                  : tasks.map((task: Task) => (
                    <tr key={task.id} className="table-row-hover">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-white">{task.title}</p>
                        {task.description && <p className="text-xs text-slate-500 truncate max-w-xs mt-0.5">{task.description}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${TASK_STATUS_COLORS[task.status]}`}>{task.status.replace('_',' ')}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {task.dueDate ? (
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatDate(task.dueDate)}</span>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {hasPermission(PERMISSION_ATOMS.TASKS_EDIT) && (
                            <button onClick={() => setEditTask(task)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 transition-all">
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {hasPermission(PERMISSION_ATOMS.TASKS_DELETE) && (
                            <button onClick={() => setDeleteId(task.id)}
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

        <Modal open={showCreate} onClose={() => { setShowCreate(false); reset(); }} title="New Task">
          <TaskForm onSubmit={(data: any) => createMutation.mutate(data)} loading={createMutation.isPending} />
        </Modal>
        <Modal open={!!editTask} onClose={() => { setEditTask(null); reset(); }} title="Edit Task">
          {editTask && <TaskForm onSubmit={(data: any) => updateMutation.mutate({ id: editTask.id, data })} loading={updateMutation.isPending} defaultValues={editTask} />}
        </Modal>
        <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} title="Delete Task" description="Delete this task permanently?" danger />
      </div>
    </AuthGuard>
  );
}
