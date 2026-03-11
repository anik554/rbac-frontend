import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, fmt = 'MMM d, yyyy') {
  return format(new Date(date), fmt);
}

export function timeAgo(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

export function getFullName(user: { firstName: string; lastName: string }) {
  return `${user.firstName} ${user.lastName}`;
}

export const ROLE_COLORS = {
  admin:    'bg-red-100 text-red-700 border-red-200',
  manager:  'bg-purple-100 text-purple-700 border-purple-200',
  agent:    'bg-blue-100 text-blue-700 border-blue-200',
  customer: 'bg-green-100 text-green-700 border-green-200',
};

export const STATUS_COLORS = {
  active:    'bg-emerald-100 text-emerald-700',
  suspended: 'bg-yellow-100 text-yellow-700',
  banned:    'bg-red-100 text-red-700',
};

export const LEAD_STATUS_COLORS = {
  new:       'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  qualified: 'bg-purple-100 text-purple-700',
  lost:      'bg-red-100 text-red-700',
  converted: 'bg-emerald-100 text-emerald-700',
};

export const TASK_STATUS_COLORS = {
  todo:        'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-100 text-blue-700',
  done:        'bg-emerald-100 text-emerald-700',
  cancelled:   'bg-red-100 text-red-700',
};

export const PRIORITY_COLORS = {
  low:    'bg-slate-100 text-slate-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high:   'bg-red-100 text-red-700',
};

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const e = error as { response?: { data?: { message?: string | string[] } }; message?: string };
    const msg = e.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string') return msg;
    if (e.message) return e.message;
  }
  return 'Something went wrong. Please try again.';
}
