import type { AppearanceConfig, ThemeMode } from '../types/portfolio';
import { resolveAssetUrl } from '../utils/assets';
import { getSkyBackdropAsset } from '../utils/theme';

interface SkyAtmosphereProps {
  appearance: AppearanceConfig;
  mode: ThemeMode;
  variant?: 'full' | 'cv';
  insideStudio?: boolean;
}

const POSITION_CLASS: Record<'top' | 'center' | 'bottom', string> = {
  top: 'object-top',
  center: 'object-center',
  bottom: 'object-bottom',
};

export function SkyAtmosphere({
  appearance,
  mode,
  variant = 'full',
  insideStudio = false,
}: SkyAtmosphereProps) {
  const asset = getSkyBackdropAsset(appearance, mode);

  if (!asset) {
    return (
      <div
        aria-hidden="true"
        className="no-print pointer-events-none absolute inset-0 overflow-hidden select-none"
      >
        <div
          className="mx-auto h-72 w-full max-w-5xl opacity-15 blur-3xl"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, var(--accent), transparent 72%)',
          }}
        />
      </div>
    );
  }

  const imageUrl = resolveAssetUrl(asset.imagePath);
  const isDarkMode = mode === 'dark';

  // Full-page custom wallpaper mode
  if (asset.isCustom && asset.fullPage && variant === 'full') {
    const alpha = Math.min(0.92, Math.max(0.15, asset.overlayStrength / 100));
    const positionClass = POSITION_CLASS[asset.position] ?? 'object-center';
    return (
      <div
        aria-hidden="true"
        className={`no-print pointer-events-none inset-0 overflow-hidden select-none ${
          insideStudio ? 'absolute' : 'fixed'
        }`}
      >
        <img
          src={imageUrl}
          alt=""
          className={`h-full w-full object-cover ${positionClass}`}
          style={
            asset.blur > 0
              ? { filter: `blur(${asset.blur}px)`, transform: 'scale(1.06)' }
              : undefined
          }
        />
        <div
          className="absolute inset-0"
          style={{
            background: isDarkMode
              ? `linear-gradient(180deg, rgba(6, 15, 34, ${alpha}) 0%, rgba(9, 20, 42, ${Math.min(
                  0.92,
                  alpha + 0.08,
                )}) 100%)`
              : `linear-gradient(180deg, rgba(242, 248, 255, ${Math.max(
                  0.2,
                  alpha - 0.1,
                )}) 0%, rgba(246, 250, 255, ${Math.min(0.95, alpha + 0.12)}) 100%)`,
          }}
        />
      </div>
    );
  }

  const positionClass = asset.isCustom
    ? POSITION_CLASS[asset.position] ?? 'object-center'
    : isDarkMode
      ? 'object-center'
      : 'object-[50%_26%]';

  const customAlpha = Math.min(0.92, Math.max(0.15, asset.overlayStrength / 100));

  return (
    <div
      aria-hidden="true"
      className="no-print pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      {/* Top Horizon Backdrop with Feathered Bottom Dissolve */}
      <div
        className={`relative w-full ${
          variant === 'full' ? 'h-[520px] sm:h-[600px]' : 'h-[260px] sm:h-[290px]'
        }`}
        style={{
          WebkitMaskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 44%, rgba(0,0,0,0) 100%)',
          maskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 44%, rgba(0,0,0,0) 100%)',
        }}
      >
        <img
          src={imageUrl}
          alt=""
          className={`h-full w-full object-cover ${positionClass}`}
          style={
            asset.isCustom && asset.blur > 0
              ? { filter: `blur(${asset.blur}px)`, transform: 'scale(1.06)' }
              : undefined
          }
        />

        {/* Readability Veil */}
        {asset.isCustom ? (
          <div
            className="absolute inset-0"
            style={{
              background: isDarkMode
                ? `linear-gradient(180deg, rgba(6, 15, 34, ${customAlpha}) 0%, rgba(9, 20, 42, ${Math.min(
                    0.92,
                    customAlpha + 0.08,
                  )}) 68%, transparent 100%)`
                : `linear-gradient(180deg, rgba(242, 248, 255, ${Math.max(
                    0.2,
                    customAlpha - 0.1,
                  )}) 0%, rgba(246, 250, 255, ${Math.min(
                    0.95,
                    customAlpha + 0.12,
                  )}) 68%, transparent 100%)`,
            }}
          />
        ) : asset.isDarkHero ? (
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(6, 15, 34, 0.50) 0%, rgba(8, 22, 48, 0.36) 52%, transparent 100%)',
            }}
          />
        ) : (
          <>
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(226, 241, 255, 0.54) 0%, rgba(238, 247, 255, 0.78) 44%, rgba(246, 250, 255, 0.96) 82%, #F6FAFF 100%)',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at 28% 38%, rgba(248, 252, 255, 0.65), transparent 64%)',
              }}
            />
          </>
        )}
      </div>

      {/* Natural Sunlit or Moonlit Atmospheric Glow */}
      {!asset.isCustom && (
        <div
          className="absolute inset-x-0 top-0 h-[520px]"
          style={{
            background: isDarkMode
              ? 'radial-gradient(circle at 82% 8%, rgba(191, 219, 254, 0.18), transparent 45%)'
              : 'radial-gradient(circle at 86% 6%, rgba(255, 248, 220, 0.46), transparent 46%)',
          }}
        />
      )}

      {/* Delicate Micro-Starfield + Shooting Star in Built-in Night Mode */}
      {!asset.isCustom && isDarkMode && (
        <>
          <div
            className="starfield-layer absolute inset-0 opacity-75"
            style={{
              WebkitMaskImage:
                'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 55%, transparent 92%)',
              maskImage:
                'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 55%, transparent 92%)',
            }}
          />
          {variant === 'full' && (
            <svg
              viewBox="0 0 1200 420"
              className="absolute inset-x-0 top-8 h-[360px] w-full opacity-70"
            >
              <circle cx="160" cy="72" r="1.8" fill="#E0F2FE" className="animate-twinkle" />
              <circle
                cx="390"
                cy="48"
                r="1.5"
                fill="#FFFFFF"
                className="animate-twinkle"
                style={{ animationDelay: '1.1s' }}
              />
              <circle
                cx="810"
                cy="66"
                r="1.9"
                fill="#BAE6FD"
                className="animate-twinkle"
                style={{ animationDelay: '2.2s' }}
              />
              <g className="animate-shooting-star" transform="translate(960, 56)">
                <line
                  x1="0"
                  y1="0"
                  x2="58"
                  y2="-26"
                  stroke="url(#shootGrad)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <circle cx="0" cy="0" r="2" fill="#FFFFFF" />
              </g>
              <defs>
                <linearGradient id="shootGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#93C5FD" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          )}
        </>
      )}

      {/* Quiet Sunbeam & Drifting SVG Cloud Veils Bridging Built-in Sky into Content */}
      {!asset.isCustom && variant === 'full' && (
        <>
          {!isDarkMode && (
            <svg
              viewBox="0 0 1200 320"
              className="animate-plane-glide absolute right-8 top-24 hidden h-16 w-32 opacity-40 lg:block"
            >
              <path d="M540 120 L578 104 L556 128 L552 122 Z" fill="#FFFFFF" />
              <path d="M552 122 L578 104 L560 126 Z" fill="#DBEAFE" />
            </svg>
          )}

          {/* Layer 1: Gentle animated feathered vector cloud */}
          <svg
            viewBox="0 0 1440 220"
            preserveAspectRatio="none"
            className={`animate-cloud-a absolute -inset-x-8 top-[350px] h-40 w-[calc(100%+4rem)] blur-[18px] sm:top-[410px] sm:h-48 ${
              isDarkMode ? 'opacity-20' : 'opacity-65'
            }`}
          >
            <path
              d="M0,128 C160,62 320,148 480,104 C640,60 800,152 960,96 C1120,42 1280,132 1440,88 L1440,220 L0,220 Z"
              fill={isDarkMode ? '#183364' : '#FFFFFF'}
            />
          </svg>

          {/* Layer 2: Counter-drifting pale horizon cloud blending smoothly to porcelain */}
          <svg
            viewBox="0 0 1440 220"
            preserveAspectRatio="none"
            className={`animate-cloud-b absolute -inset-x-8 top-[385px] h-44 w-[calc(100%+4rem)] blur-[14px] sm:top-[445px] sm:h-52 ${
              isDarkMode ? 'opacity-25' : 'opacity-80'
            }`}
          >
            <path
              d="M0,158 C210,108 390,176 580,136 C770,96 980,172 1180,126 C1310,98 1390,134 1440,142 L1440,220 L0,220 Z"
              fill={isDarkMode ? '#0A1833' : '#F2F7FE'}
            />
          </svg>

          {/* Subtle Lower Page Ambient Cloud Echo */}
          <div
            className={`absolute inset-x-0 bottom-0 h-[440px] ${
              isDarkMode ? 'opacity-[0.18]' : 'opacity-[0.10]'
            }`}
            style={{
              WebkitMaskImage:
                'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 55%, transparent 100%)',
              maskImage:
                'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 55%, transparent 100%)',
            }}
          >
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover object-bottom"
            />
          </div>
        </>
      )}
    </div>
  );
}
