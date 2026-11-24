import { useState, type FormEvent } from 'react';
import { KeyRound, Lock, Mail } from 'lucide-react';
import type { ProfileInfo, RouteView } from '../types/portfolio';
import { normalizeExternalUrl } from '../utils/assets';
import { getSocialIcon } from './FooterSocial';

export { getSocialIcon };

interface FooterProps {
  profile: ProfileInfo;
  onNavigate: (route: RouteView) => void;
  studioEnabled?: boolean;
  studioUnlocked?: boolean;
  onUnlockStudio?: (password: string) => Promise<boolean>;
  onOpenStudio?: () => void;
  onLockStudio?: () => void;
}

export function Footer({
  profile,
  onNavigate,
  studioEnabled = true,
  studioUnlocked = false,
  onUnlockStudio,
  onOpenStudio,
  onLockStudio,
}: FooterProps) {
  const year = new Date().getFullYear();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!onUnlockStudio || checking) return;
    if (!password.trim()) {
      setError('Vui lòng nhập mật khẩu');
      return;
    }
    setChecking(true);
    setError('');
    try {
      const ok = await onUnlockStudio(password);
      if (ok) {
        setPassword('');
        setError('');
      } else {
        setError('Mật khẩu chưa đúng');
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <footer className="no-print relative z-10 mt-16 border-t border-token py-8">
      <div className="mx-auto max-w-5xl px-4 text-xs ink-muted sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p>
            © {year} <span className="font-medium ink-secondary">{profile.fullName}</span>
            {profile.role ? ` • ${profile.role}` : ''}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="transition hover:ink-primary"
            >
              Giới thiệu &amp; Portfolio
            </button>
            <button
              type="button"
              onClick={() => onNavigate('cv')}
              className="transition hover:ink-primary"
            >
              CV
            </button>

            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center transition hover:ink-primary"
                aria-label="Email"
              >
                <Mail className="h-3.5 w-3.5" />
              </a>
            )}

            {profile.socials.map((soc) => {
              const href = normalizeExternalUrl(soc.url);
              if (!href) return null;
              const Icon = getSocialIcon(soc.platform);
              return (
                <a
                  key={soc.id}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  title={soc.label}
                  aria-label={soc.label}
                  className="transition hover:ink-primary"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Bottom Discreet Password-Gated Studio Access */}
        {studioEnabled && (
          <div className="mt-6 flex flex-col items-start justify-between gap-3 border-t border-token pt-4 sm:flex-row sm:items-center">
            <span className="inline-flex items-center gap-1.5 text-[11px] ink-muted">
              <Lock className="h-3 w-3 opacity-75" />
              Quản trị nội dung &amp; giao diện (Studio)
            </span>

            {studioUnlocked ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Studio đang mở khóa
                </span>
                <button
                  type="button"
                  onClick={onOpenStudio}
                  className="surface-glass rounded-full border border-token px-3 py-1 text-[11px] font-semibold ink-primary transition hover:border-token-strong"
                >
                  Mở Studio
                </button>
                <button
                  type="button"
                  onClick={onLockStudio}
                  className="rounded-full px-2.5 py-1 text-[11px] ink-muted transition hover:surface-subtle hover:ink-primary"
                >
                  Khóa lại
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute top-1/2 left-2.5 h-3 w-3 -translate-y-1/2 ink-muted opacity-70" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Mật khẩu Studio..."
                    aria-label="Nhập mật khẩu để vào Studio"
                    autoComplete="current-password"
                    className="w-44 rounded-full border border-token bg-[var(--bg-surface)] py-1 pr-3 pl-7 text-[11px] ink-primary outline-none transition placeholder:text-[var(--ink-muted)]/60 focus:border-[var(--accent)]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={checking}
                  className="surface-glass rounded-full border border-token px-3 py-1 text-[11px] font-semibold ink-primary transition hover:border-token-strong disabled:opacity-50"
                >
                  {checking ? 'Đang kiểm tra...' : 'Vào Studio'}
                </button>
                {error && (
                  <span role="alert" className="text-[11px] font-medium text-rose-500">
                    {error}
                  </span>
                )}
              </form>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}
