import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  text: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  if (!toast) return null;

  const Icon =
    toast.type === 'success'
      ? CheckCircle2
      : toast.type === 'error'
        ? AlertCircle
        : Info;

  const toneClass =
    toast.type === 'success'
      ? 'border-emerald-500/30 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-950/90 dark:text-emerald-100'
      : toast.type === 'error'
        ? 'border-rose-500/30 bg-rose-50 text-rose-900 dark:border-rose-500/30 dark:bg-rose-950/90 dark:text-rose-100'
        : 'border-zinc-200 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100';

  return (
    <div className="no-print fixed right-4 bottom-4 z-50 max-w-md">
      <div
        role="status"
        className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${toneClass}`}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <p className="flex-1 leading-snug">{toast.text}</p>
        {toast.actionLabel && toast.onAction && (
          <button
            type="button"
            onClick={() => {
              toast.onAction?.();
              onClose();
            }}
            className="shrink-0 rounded-lg border border-current/25 bg-white/70 px-2.5 py-1 text-xs font-semibold transition hover:bg-white dark:bg-zinc-800/80 dark:hover:bg-zinc-800"
          >
            {toast.actionLabel}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="rounded p-0.5 opacity-60 transition hover:opacity-100"
          aria-label="Đóng thông báo"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
