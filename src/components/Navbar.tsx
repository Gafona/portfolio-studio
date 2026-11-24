import { useEffect, useState } from 'react';
import type { ProfileInfo, RouteView, ThemeMode } from '../types/portfolio';
import { CelestialThemeSwitch } from './SkyIllustrations';

interface NavbarProps {
  profile: ProfileInfo;
  route: RouteView;
  mode: ThemeMode;
  overDarkSky?: boolean;
  onNavigate: (route: RouteView) => void;
  onToggleTheme: () => void;
}

const NAV_ITEMS: Array<{ id: Exclude<RouteView, 'studio'>; label: string }> = [
  { id: 'home', label: 'Giới thiệu' },
  { id: 'cv', label: 'CV' },
];

export function Navbar({
  profile,
  route,
  mode,
  overDarkSky = false,
  onNavigate,
  onToggleTheme,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 220);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const useLightTextOnSky = overDarkSky && !scrolled;

  const pillStyle = useLightTextOnSky
    ? 'border-white/25 bg-white/15 text-white shadow-[0_8px_32px_rgba(7,17,36,0.18)]'
    : 'surface-glass border-token ink-primary';

  const linkMuted = useLightTextOnSky
    ? 'text-white/80 hover:text-white'
    : 'ink-muted hover:ink-primary';

  const linkActive = useLightTextOnSky ? 'text-white font-semibold' : 'ink-primary font-semibold';

  return (
    <header className="no-print fixed inset-x-0 top-3 z-30 mx-auto w-full max-w-5xl px-4 sm:top-4 sm:px-6">
      <div
        className={`flex h-13 items-center justify-between gap-3 rounded-full border px-4 backdrop-blur-xl transition-all duration-200 sm:px-6 ${pillStyle}`}
      >
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="font-heading truncate text-sm font-semibold tracking-tight transition hover:opacity-80"
        >
          {profile.fullName}
        </button>

        <nav aria-label="Điều hướng chính" className="flex items-center gap-5 sm:gap-8">
          {NAV_ITEMS.map((item) => {
            const active = route === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`relative py-1 text-xs transition sm:text-sm ${
                  active ? linkActive : linkMuted
                }`}
              >
                <span>{item.label}</span>
                {active && (
                  <span
                    className={`absolute right-1/2 -bottom-0.5 h-1 w-1 translate-x-1/2 rounded-full ${
                      useLightTextOnSky ? 'bg-white' : 'bg-accent'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <CelestialThemeSwitch
            mode={mode}
            onToggle={onToggleTheme}
            overDarkSky={useLightTextOnSky}
          />
        </div>
      </div>
    </header>
  );
}
