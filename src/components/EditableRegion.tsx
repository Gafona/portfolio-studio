import type { ReactNode } from 'react';
import { Pencil } from 'lucide-react';

interface EditableRegionProps {
  active?: boolean;
  label: string;
  onEdit?: () => void;
  className?: string;
  children: ReactNode;
}

export function EditableRegion({
  active = false,
  label,
  onEdit,
  className = '',
  children,
}: EditableRegionProps) {
  if (!active || !onEdit) {
    return <>{children}</>;
  }

  return (
    <div
      className={`group/edit relative rounded-[calc(var(--radius-card)+4px)] transition ${className}`}
      onClickCapture={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onEdit();
      }}
    >
      {children}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] border-2 border-dashed border-transparent transition group-hover/edit:border-[var(--accent)] group-hover/edit:bg-[var(--accent-soft)]/30"
      />
      <button
        type="button"
        tabIndex={-1}
        className="pointer-events-none absolute top-2.5 right-2.5 z-30 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold opacity-0 shadow-md transition group-hover/edit:opacity-100"
      >
        <Pencil className="h-3 w-3" />
        <span>Sửa: {label}</span>
      </button>
    </div>
  );
}
