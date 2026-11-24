import type { ReactNode } from 'react';
import type { AppearanceConfig, ThemeMode } from '../types/portfolio';
import { getSkyBackdropAsset } from '../utils/theme';

interface SkyPortraitFrameProps {
  children: ReactNode;
  mode: ThemeMode;
  isSkyTheme: boolean;
}

/**
 * Custom celestial halo frame surrounding the Hero portrait.
 * Falls back to a clean unadorned wrapper on Editorial/Minimal presets.
 */
export function SkyPortraitFrame({
  children,
  mode,
  isSkyTheme,
}: SkyPortraitFrameProps) {
  if (!isSkyTheme) {
    return <div className="relative inline-flex items-center justify-center">{children}</div>;
  }

  const isDark = mode === 'dark';

  return (
    <div className="relative inline-flex items-center justify-center p-2.5 sm:p-3">
      {/* Rotating orbital constellation ring */}
      <svg
        aria-hidden="true"
        viewBox="0 0 240 240"
        className="animate-orbit-slow pointer-events-none absolute inset-0 h-full w-full select-none"
      >
        <defs>
          <linearGradient id="skyOrbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              stopColor={isDark ? '#BAE6FD' : '#FFFFFF'}
              stopOpacity={isDark ? 0.52 : 0.72}
            />
            <stop
              offset="50%"
              stopColor={isDark ? '#7DD3FC' : '#FDE68A'}
              stopOpacity={isDark ? 0.22 : 0.45}
            />
            <stop
              offset="100%"
              stopColor={isDark ? '#E0F2FE' : '#FFFFFF'}
              stopOpacity={isDark ? 0.45 : 0.65}
            />
          </linearGradient>
        </defs>
        <circle
          cx="120"
          cy="120"
          r="112"
          fill="none"
          stroke="url(#skyOrbitGrad)"
          strokeWidth="1.25"
          strokeDasharray="6 7"
        />
        {/* Four-point celestial star top-right on orbit */}
        <path
          d="M198 44 L200.2 50.8 L207 53 L200.2 55.2 L198 62 L195.8 55.2 L189 53 L195.8 50.8 Z"
          fill={isDark ? '#E0F2FE' : '#FEF3C7'}
          opacity={0.9}
        />
        {/* Tiny secondary moonlet dot bottom-left on orbit */}
        <circle
          cx="34"
          cy="182"
          r="3.2"
          fill={isDark ? '#93C5FD' : '#FFFFFF'}
          opacity={0.85}
        />
      </svg>

      {/* Main portrait slot */}
      <div className="relative z-10">{children}</div>

      {/* Tactile floating cloud wisp at lower corner */}
      <svg
        aria-hidden="true"
        viewBox="0 0 88 38"
        className="animate-float-gentle pointer-events-none absolute -bottom-1 -left-2 z-20 h-7 w-16 drop-shadow-sm select-none sm:h-8 sm:w-20"
      >
        <path
          d="M16 32 H68 C75 32 80 27.5 80 21.5 C80 16 75.5 11.8 69.8 11.8 C68.6 11.8 67.5 12 66.4 12.3 C63.8 6.4 57.6 2.5 50.4 2.5 C41.3 2.5 33.8 8.8 32.5 16.9 C30.8 15.8 28.7 15.2 26.5 15.2 C20.4 15.2 15.5 19.7 15.3 25.3 C11.4 25.8 8.5 28.5 8.5 31.4 C8.5 31.8 11.8 32 16 32 Z"
          fill={isDark ? 'rgba(30, 58, 110, 0.92)' : 'rgba(255, 255, 255, 0.94)'}
          stroke={isDark ? 'rgba(186, 230, 253, 0.35)' : 'rgba(255, 255, 255, 1)'}
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

interface CelestialThemeSwitchProps {
  mode: ThemeMode;
  onToggle: () => void;
  overDarkSky?: boolean;
}

/**
 * Custom illustrated Day Sun / Night Crescent-Stars pill toggle.
 */
export function CelestialThemeSwitch({
  mode,
  onToggle,
  overDarkSky = false,
}: CelestialThemeSwitchProps) {
  const isDark = mode === 'dark';

  const trackClass = isDark
    ? 'border-sky-300/25 bg-slate-900/75 shadow-inner'
    : overDarkSky
      ? 'border-white/35 bg-sky-900/25 shadow-inner'
      : 'border-sky-500/25 bg-sky-100/80 shadow-inner';

  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={isDark}
      title={isDark ? 'Chuyển sang ban ngày' : 'Chuyển sang ban đêm'}
      aria-label={isDark ? 'Chuyển sang ban ngày' : 'Chuyển sang ban đêm'}
      className={`group relative inline-flex h-7 w-[54px] shrink-0 items-center rounded-full border p-0.5 backdrop-blur-md transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${trackClass}`}
    >
      {/* Background miniature sky details */}
      <svg
        aria-hidden="true"
        viewBox="0 0 54 28"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        {isDark ? (
          /* Night stars on left side */
          <g fill="#E0F2FE">
            <circle cx="12" cy="10" r="1" opacity="0.9" />
            <circle cx="19" cy="18" r="0.85" opacity="0.7" />
            <path d="M23 7 L23.6 9 L25.6 9.6 L23.6 10.2 L23 12.2 L22.4 10.2 L20.4 9.6 L22.4 9 Z" />
          </g>
        ) : (
          /* Day mini cloud tuft on right side */
          <path
            d="M32 19 H44 C46 19 47.5 17.7 47.5 16 C47.5 14.4 46.2 13.1 44.5 13.1 C43.7 11.2 41.8 10 39.6 10 C37.1 10 35 11.6 34.4 13.8 C32.8 14.1 31.6 15.3 31.6 16.8 C31.6 18 32 19 32 19 Z"
            fill="#FFFFFF"
            opacity="0.9"
          />
        )}
      </svg>

      {/* Sliding Sun / Moon Orb */}
      <span
        className={`relative z-10 flex h-5.5 w-5.5 items-center justify-center rounded-full shadow-sm transition-transform duration-300 ease-out ${
          isDark
            ? 'translate-x-[25px] bg-gradient-to-br from-indigo-300 via-sky-200 to-blue-100'
            : 'translate-x-0 bg-gradient-to-br from-amber-200 via-amber-300 to-orange-300'
        }`}
      >
        {isDark ? (
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-indigo-950" fill="currentColor">
            <path d="M11.6 10.6A4.8 4.8 0 0 1 6.4 3.4a4.9 4.9 0 1 0 5.9 7.2c-.23.02-.46 0-.7 0Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-amber-900" fill="currentColor">
            <circle cx="8" cy="8" r="3.4" />
            <path
              d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
          </svg>
        )}
      </span>
    </button>
  );
}

interface TimelineNodeGlyphProps {
  kind: string;
  featured?: boolean;
  isSkyTheme: boolean;
}

/**
 * Custom celestial milestone node glyphs along the Timeline spine.
 */
export function TimelineNodeGlyph({
  kind,
  featured = false,
  isSkyTheme,
}: TimelineNodeGlyphProps) {
  if (!isSkyTheme) {
    return (
      <span
        className="flex h-3 w-3 items-center justify-center rounded-full border-2 border-token-strong surface-card"
        style={featured ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)' } : undefined}
      />
    );
  }

  return (
    <span
      className="surface-glass flex h-6 w-6 items-center justify-center rounded-full border border-token-strong transition-transform duration-200 group-hover:scale-110"
      style={
        featured
          ? {
              borderColor: 'var(--accent)',
              boxShadow: '0 0 0 4px var(--accent-soft)',
            }
          : undefined
      }
    >
      {kind === 'project' ? (
        /* Four-point Polaris Star */
        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-accent-safe" fill="currentColor">
          <path d="M10 2 L11.9 8.1 L18 10 L11.9 11.9 L10 18 L8.1 11.9 L2 10 L8.1 8.1 Z" />
        </svg>
      ) : kind === 'achievement' ? (
        /* Orbiting Diamond Crest */
        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-amber-500 dark:text-amber-300" fill="none">
          <path
            d="M10 3 L12.5 7.5 L17 10 L12.5 12.5 L10 17 L7.5 12.5 L3 10 L7.5 7.5 Z"
            fill="currentColor"
          />
        </svg>
      ) : kind === 'education' ? (
        /* Rising Sun Horizon */
        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-accent-safe" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <path d="M4 13.5 H16" />
          <path d="M6.5 13.5 A3.5 3.5 0 0 1 13.5 13.5" fill="currentColor" fillOpacity="0.25" />
          <path d="M10 5 V6.8M5.2 8.2 L6.4 9.4M14.8 8.2 L13.6 9.4" />
        </svg>
      ) : (
        /* Compass Diamond for Work Experience */
        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-accent-safe" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="10" cy="10" r="6.2" />
          <path d="M10 6.2 L12.2 10 L10 13.8 L7.8 10 Z" fill="currentColor" />
        </svg>
      )}
    </span>
  );
}

interface SkyHorizonDividerProps {
  appearance: AppearanceConfig;
  mode: ThemeMode;
}

/**
 * Custom vector cloud horizon layer dividing lower content and footer.
 * Hidden automatically in Editorial/Minimal/none presets and print output.
 */
export function SkyHorizonDivider({ appearance, mode }: SkyHorizonDividerProps) {
  const asset = getSkyBackdropAsset(appearance, mode);
  if (!asset) return null;

  const isDark = mode === 'dark';

  return (
    <div
      aria-hidden="true"
      className="no-print pointer-events-none relative mx-auto mt-10 h-20 w-full max-w-6xl overflow-hidden select-none sm:h-24"
    >
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id="horizonWaveDay" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#1D4ED8' : '#93C5FD'} stopOpacity={isDark ? 0.14 : 0.24} />
            <stop offset="100%" stopColor={isDark ? '#071022' : '#FAFDFE'} stopOpacity="0" />
          </linearGradient>
        </defs>

        <g className="animate-cloud-a">
          <path
            d="M-60,84 C110,38 250,92 420,58 C590,24 760,86 950,52 C1080,30 1160,64 1260,72 L1260,120 L-60,120 Z"
            fill="url(#horizonWaveDay)"
          />
        </g>

        <g className="animate-cloud-b">
          <path
            d="M-60,96 C150,64 320,108 510,78 C710,48 890,104 1080,74 C1170,60 1220,78 1260,88 L1260,120 L-60,120 Z"
            fill={isDark ? 'rgba(147, 197, 253, 0.08)' : 'rgba(255, 255, 255, 0.72)'}
          />
        </g>

        {isDark ? (
          <g fill="#E0F2FE" opacity="0.65">
            <circle cx="240" cy="34" r="1.4" />
            <circle cx="620" cy="24" r="1.6" />
            <circle cx="980" cy="36" r="1.2" />
          </g>
        ) : (
          /* Quiet paper-plane gliding across sky horizon */
          <g transform="translate(860, 26)" className="animate-plane-glide" opacity="0.45">
            <path
              d="M0 10 L26 2 L12 16 L9 11 Z"
              fill="#1558C0"
            />
            <path
              d="M9 11 L26 2 L14 14 Z"
              fill="#60A5FA"
            />
          </g>
        )}
      </svg>
    </div>
  );
}

interface EmptyCloudIllustrationProps {
  title?: string;
  subtitle?: string;
}

/**
 * Custom vector illustration for empty timeline filter results.
 */
export function EmptyCloudIllustration({
  title = 'Chưa có dấu mốc phù hợp',
  subtitle = 'Thử đổi bộ lọc hoặc bổ sung thêm dự án, kinh nghiệm trong Local Studio.',
}: EmptyCloudIllustrationProps) {
  return (
    <div className="surface-glass radius-card border border-token px-6 py-10 text-center">
      <svg
        aria-hidden="true"
        viewBox="0 0 180 96"
        className="animate-float-gentle mx-auto mb-3 h-20 w-36 select-none"
      >
        <circle cx="122" cy="28" r="14" fill="var(--accent-soft)" />
        <path
          d="M122 10 V14 M122 42 V46 M104 28 H108 M136 28 H140 M109 15 L112 18 M132 38 L135 41"
          stroke="var(--accent-text, var(--accent))"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M42 74 H136 C146 74 154 66.5 154 57 C154 48.2 147 41.2 138 40.5 C135.5 29.8 125.5 22 113.5 22 C99.2 22 87.5 32.2 85.8 45.2 C83.4 44 80.6 43.3 77.6 43.3 C67.6 43.3 59.5 50.6 59 59.8 C50.4 60.4 42 66.2 42 74 Z"
          fill="var(--bg-surface)"
          stroke="var(--border-strong)"
          strokeWidth="1.5"
        />
        <path
          d="M89 48 L91 53.5 L96.5 55.5 L91 57.5 L89 63 L87 57.5 L81.5 55.5 L87 53.5 Z"
          fill="var(--accent-text, var(--accent))"
          opacity="0.85"
        />
      </svg>
      <p className="font-heading text-sm font-semibold ink-primary">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed ink-muted">{subtitle}</p>
    </div>
  );
}
