'use client';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

// Global toast store
let listeners: Array<(toasts: Toast[]) => void> = [];
let toasts: Toast[] = [];

function emit() { listeners.forEach((l) => l([...toasts])); }

export function toast(type: ToastType, title: string, description?: string) {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, type, title, description }];
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, 4000);
}

const ICONS = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
  error:   <AlertCircle className="w-5 h-5 text-red-400" />,
  info:    <Info className="w-5 h-5 text-blue-400" />,
};

const STYLES = {
  success: 'border-emerald-500/30 bg-emerald-500/10',
  error:   'border-red-500/30 bg-red-500/10',
  info:    'border-blue-500/30 bg-blue-500/10',
};

export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.push(setItems);
    return () => { listeners = listeners.filter((l) => l !== setItems); };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {items.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl',
            'shadow-2xl animate-fadeInUp',
            STYLES[t.type]
          )}
        >
          {ICONS[t.type]}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">{t.title}</p>
            {t.description && <p className="text-xs text-slate-400 mt-0.5">{t.description}</p>}
          </div>
          <button
            onClick={() => { toasts = toasts.filter((i) => i.id !== t.id); emit(); }}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
