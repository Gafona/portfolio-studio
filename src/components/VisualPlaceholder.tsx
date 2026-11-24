import { Award, Briefcase, Code2 } from 'lucide-react';

interface VisualPlaceholderProps {
  variant: 'avatar' | 'project' | 'achievement' | 'experience';
  title: string;
  monogram?: string;
  subtitle?: string;
  period?: string;
  tags?: string[];
  className?: string;
}

function hashTitle(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}

const KIND_LABELS: Record<Exclude<VisualPlaceholderProps['variant'], 'avatar'>, string> = {
  project: 'DỰ ÁN',
  achievement: 'THÀNH TÍCH',
  experience: 'HOẠT ĐỘNG',
};

export function VisualPlaceholder({
  variant,
  title,
  monogram,
  subtitle,
  period,
  tags,
  className = '',
}: VisualPlaceholderProps) {
  if (variant === 'avatar') {
    const initials =
      monogram?.trim() ||
      title
        .split(/\s+/)
        .filter(Boolean)
        .slice(-2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('') ||
      'ME';

    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-accent font-heading font-bold tracking-tight select-none ${className}`}
        aria-label={title}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.3),transparent_62%)]" />
        <span className="relative z-10">{initials}</span>
      </div>
    );
  }

  const Icon =
    variant === 'achievement'
      ? Award
      : variant === 'experience'
        ? Briefcase
        : Code2;

  const h = hashTitle(title);
  const angle = 125 + (h % 45);
  const orbX = 68 + (h % 24);
  const orbY = 12 + ((h >> 3) % 30);

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden border border-token p-5 select-none ${className}`}
      style={{
        background: `linear-gradient(${angle}deg, var(--bg-subtle) 0%, var(--bg-surface) 58%, var(--accent-soft) 100%)`,
      }}
    >
      {/* Architectural Grid SVG */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.22]"
      >
        <defs>
          <pattern
            id={`grid-${h}`}
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke="var(--border-strong)"
              strokeWidth="0.7"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${h})`} />
      </svg>

      {/* Ambient Accent Orb */}
      <div
        className="pointer-events-none absolute h-40 w-40 rounded-full opacity-25 blur-3xl"
        style={{
          backgroundColor: 'var(--accent)',
          left: `${orbX}%`,
          top: `${orbY}%`,
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Top Metadata Strip */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent bg-accent-soft px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-accent">
          <Icon className="h-3 w-3" />
          {KIND_LABELS[variant]}
        </span>
        {period && (
          <span className="rounded-md border border-token surface-card px-2 py-0.5 font-mono text-[10px] font-medium ink-muted">
            {period}
          </span>
        )}
      </div>

      {/* Editorial Typographic Centerpiece */}
      <div className="relative z-10 my-auto py-3">
        <p className="font-heading line-clamp-2 text-base leading-snug font-bold tracking-tight ink-primary sm:text-lg">
          {title}
        </p>
        {subtitle && (
          <p className="mt-1 line-clamp-1 text-xs ink-muted">{subtitle}</p>
        )}
      </div>

      {/* Bottom Tech Strip */}
      {tags && tags.length > 0 ? (
        <div className="relative z-10 flex flex-wrap gap-1.5">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded border border-token surface-card px-2 py-0.5 text-[10px] font-medium ink-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : (
        <div className="relative z-10 h-1 w-12 rounded-full bg-accent opacity-60" />
      )}
    </div>
  );
}
