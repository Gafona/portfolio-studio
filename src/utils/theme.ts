import type { CSSProperties } from 'react';
import type {
  AppearanceConfig,
  BorderRadiusScale,
  FontPreset,
  SkyBackdrop,
  StylePreset,
  ThemeMode,
} from '../types/portfolio';
import { getContrastColor, hexToRgb } from './assets';

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface AccentPreset {
  name: string;
  value: string;
}

export const ACCENT_PRESETS: AccentPreset[] = [
  { name: 'Azure Sky', value: '#1558C0' },
  { name: 'Cerulean', value: '#0369A1' },
  { name: 'Indigo', value: '#4338CA' },
  { name: 'Teal', value: '#0F766E' },
  { name: 'Amber Gold', value: '#B45309' },
  { name: 'Slate', value: '#334155' },
];

export interface FontPresetDefinition {
  id: FontPreset;
  label: string;
  description: string;
  heading: string;
  body: string;
}

export const FONT_PRESETS: Record<FontPreset, FontPresetDefinition> = {
  modern: {
    id: 'modern',
    label: 'Hiện đại (Be Vietnam Pro)',
    description: 'Thoáng, rõ dấu tiếng Việt',
    heading: '"Be Vietnam Pro", system-ui, -apple-system, sans-serif',
    body: '"Inter", system-ui, -apple-system, sans-serif',
  },
  editorial: {
    id: 'editorial',
    label: 'Biên tập (Playfair & Jakarta)',
    description: 'Tinh tế kiểu tạp chí nghệ thuật',
    heading: '"Playfair Display", Georgia, serif',
    body: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
  },
  tech: {
    id: 'tech',
    label: 'Sản phẩm (Space Grotesk)',
    description: 'Hiện đại, sắc nét cho công nghệ',
    heading: '"Space Grotesk", "Be Vietnam Pro", sans-serif',
    body: '"Inter", system-ui, -apple-system, sans-serif',
  },
};

export interface SurfaceTokens {
  canvas: string;
  skyPageBg: string;
  surface: string;
  glass: string;
  glassBg: string;
  glassHighlight: string;
  shadowGlass: string;
  subtle: string;
  inkPrimary: string;
  inkSecondary: string;
  inkMuted: string;
  borderSubtle: string;
  borderStrong: string;
  shadowCard: string;
}

export interface StylePresetDefinition {
  id: StylePreset;
  label: string;
  description: string;
  defaultMode: ThemeMode;
  defaultSkyBackdrop: SkyBackdrop;
  swatches: [string, string, string];
  light: SurfaceTokens;
  dark: SurfaceTokens;
}

export const STYLE_PRESETS: Record<StylePreset, StylePresetDefinition> = {
  sky: {
    id: 'sky',
    label: 'Bầu Trời & Sao',
    description: 'Trời đêm sao lấp lánh (Sáng: Mây ban mai trong trẻo)',
    defaultMode: 'dark',
    defaultSkyBackdrop: 'cumulus',
    swatches: ['#1558C0', '#9FD0FB', '#091732'],
    light: {
      canvas: '#F6FAFF',
      skyPageBg:
        'linear-gradient(180deg, #CBE4FF 0%, #E2F0FE 18%, #F0F6FE 36%, #F7FAFF 62%, #FFFFFF 100%)',
      surface: '#FFFFFF',
      glass: 'rgba(255, 255, 255, 0.88)',
      glassBg:
        'linear-gradient(155deg, rgba(255, 255, 255, 0.92) 0%, rgba(244, 249, 255, 0.82) 100%)',
      glassHighlight: 'rgba(255, 255, 255, 0.96)',
      shadowGlass: '0 14px 40px -18px rgba(13, 47, 108, 0.16)',
      subtle: '#EAF1FC',
      inkPrimary: '#0B1F3C',
      inkSecondary: '#233E63',
      inkMuted: '#3B567A',
      borderSubtle: 'rgba(21, 88, 192, 0.14)',
      borderStrong: 'rgba(21, 88, 192, 0.30)',
      shadowCard: '0 8px 28px -12px rgba(12, 31, 60, 0.10)',
    },
    dark: {
      canvas: '#071022',
      skyPageBg:
        'linear-gradient(180deg, #091732 0%, #0E2247 26%, #0A1833 62%, #071022 100%)',
      surface: '#0F1D38',
      glass: 'rgba(15, 29, 56, 0.80)',
      glassBg:
        'linear-gradient(155deg, rgba(18, 36, 72, 0.82) 0%, rgba(10, 22, 46, 0.74) 100%)',
      glassHighlight: 'rgba(186, 218, 255, 0.20)',
      shadowGlass: '0 18px 44px -18px rgba(2, 8, 24, 0.78)',
      subtle: '#162849',
      inkPrimary: '#F1F6FF',
      inkSecondary: '#C9DAF0',
      inkMuted: '#98B3D6',
      borderSubtle: 'rgba(147, 197, 253, 0.18)',
      borderStrong: 'rgba(147, 197, 253, 0.32)',
      shadowCard: '0 14px 36px -14px rgba(2, 8, 22, 0.75)',
    },
  },
  'sky-pastel': {
    id: 'sky-pastel',
    label: 'Mây Màu Nước',
    description: 'Tranh mây pastel dịu nhẹ, chữ xanh đậm thanh thoát',
    defaultMode: 'light',
    defaultSkyBackdrop: 'pastel',
    swatches: ['#6EB1F5', '#DCEEFF', '#102A4C'],
    light: {
      canvas: '#F5FAFF',
      skyPageBg:
        'linear-gradient(180deg, #6EB1F5 0%, #B4DAFC 20%, #E8F3FE 34%, #F5FAFF 48%, #FFFFFF 100%)',
      surface: '#FFFFFF',
      glass: 'rgba(255, 255, 255, 0.88)',
      glassBg:
        'linear-gradient(155deg, rgba(255, 255, 255, 0.92) 0%, rgba(244, 249, 255, 0.82) 100%)',
      glassHighlight: 'rgba(255, 255, 255, 0.96)',
      shadowGlass: '0 14px 40px -18px rgba(16, 42, 76, 0.14)',
      subtle: '#ECF4FD',
      inkPrimary: '#102A4C',
      inkSecondary: '#2D4769',
      inkMuted: '#455F82',
      borderSubtle: 'rgba(56, 126, 204, 0.15)',
      borderStrong: 'rgba(56, 126, 204, 0.30)',
      shadowCard: '0 8px 28px -12px rgba(16, 42, 76, 0.09)',
    },
    dark: {
      canvas: '#09162F',
      skyPageBg:
        'linear-gradient(180deg, #0A1834 0%, #10244A 32%, #09162F 100%)',
      surface: '#101F3B',
      glass: 'rgba(16, 31, 59, 0.80)',
      glassBg:
        'linear-gradient(155deg, rgba(18, 36, 72, 0.82) 0%, rgba(10, 22, 46, 0.74) 100%)',
      glassHighlight: 'rgba(186, 218, 255, 0.20)',
      shadowGlass: '0 18px 44px -18px rgba(2, 8, 24, 0.78)',
      subtle: '#182B4D',
      inkPrimary: '#F1F6FF',
      inkSecondary: '#C8DAEE',
      inkMuted: '#98B3D6',
      borderSubtle: 'rgba(147, 197, 253, 0.18)',
      borderStrong: 'rgba(147, 197, 253, 0.32)',
      shadowCard: '0 14px 36px -14px rgba(2, 8, 22, 0.75)',
    },
  },
  editorial: {
    id: 'editorial',
    label: 'Giấy Kem Tối Giản',
    description: 'Nền kem ấm tinh giản, không ảnh nền',
    defaultMode: 'light',
    defaultSkyBackdrop: 'none',
    swatches: ['#FAF8F5', '#FFFFFF', '#1C1917'],
    light: {
      canvas: '#FAF8F5',
      skyPageBg: '#FAF8F5',
      surface: '#FFFFFF',
      glass: 'rgba(255, 255, 255, 0.92)',
      glassBg: 'rgba(255, 255, 255, 0.92)',
      glassHighlight: 'rgba(255, 255, 255, 0.96)',
      shadowGlass: '0 4px 20px -12px rgba(28, 25, 23, 0.08)',
      subtle: '#F3EFE8',
      inkPrimary: '#1C1917',
      inkSecondary: '#44403C',
      inkMuted: '#57534E',
      borderSubtle: '#E7E2D8',
      borderStrong: '#D6CFC2',
      shadowCard: '0 4px 20px -12px rgba(28, 25, 23, 0.08)',
    },
    dark: {
      canvas: '#121110',
      skyPageBg: '#121110',
      surface: '#1A1816',
      glass: 'rgba(26, 24, 22, 0.90)',
      glassBg: 'rgba(26, 24, 22, 0.90)',
      glassHighlight: 'rgba(255, 255, 255, 0.06)',
      shadowGlass: '0 10px 30px -12px rgba(0, 0, 0, 0.55)',
      subtle: '#24211E',
      inkPrimary: '#F5F2EB',
      inkSecondary: '#D6D0C4',
      inkMuted: '#ABA397',
      borderSubtle: '#2C2824',
      borderStrong: '#3E3832',
      shadowCard: '0 10px 30px -12px rgba(0, 0, 0, 0.55)',
    },
  },
  minimal: {
    id: 'minimal',
    label: 'Đơn Sắc Tinh Gọn',
    description: 'Trắng/Đen thuần khiết, tập trung tối đa vào nội dung',
    defaultMode: 'light',
    defaultSkyBackdrop: 'none',
    swatches: ['#FAFAFA', '#FFFFFF', '#09090B'],
    light: {
      canvas: '#FAFAFA',
      skyPageBg: '#FAFAFA',
      surface: '#FFFFFF',
      glass: 'rgba(255, 255, 255, 0.94)',
      glassBg: 'rgba(255, 255, 255, 0.94)',
      glassHighlight: 'rgba(255, 255, 255, 0.98)',
      shadowGlass: '0 2px 10px -4px rgba(9, 9, 11, 0.05)',
      subtle: '#F4F4F5',
      inkPrimary: '#09090B',
      inkSecondary: '#3F3F46',
      inkMuted: '#52525B',
      borderSubtle: '#E4E4E7',
      borderStrong: '#D4D4D8',
      shadowCard: '0 2px 10px -4px rgba(9, 9, 11, 0.05)',
    },
    dark: {
      canvas: '#09090B',
      skyPageBg: '#09090B',
      surface: '#111114',
      glass: 'rgba(17, 17, 20, 0.90)',
      glassBg: 'rgba(17, 17, 20, 0.90)',
      glassHighlight: 'rgba(255, 255, 255, 0.06)',
      shadowGlass: '0 12px 28px -12px rgba(0, 0, 0, 0.65)',
      subtle: '#18181B',
      inkPrimary: '#FAFAFA',
      inkSecondary: '#D4D4D8',
      inkMuted: '#A1A1AA',
      borderSubtle: '#27272A',
      borderStrong: '#3F3F46',
      shadowCard: '0 12px 28px -12px rgba(0, 0, 0, 0.65)',
    },
  },
};

export const RADIUS_PRESETS: Record<
  BorderRadiusScale,
  { label: string; card: string; btn: string }
> = {
  sharp: { label: 'Sắc nét', card: '0.5rem', btn: '0.375rem' },
  balanced: { label: 'Cân bằng', card: '1rem', btn: '0.75rem' },
  soft: { label: 'Mềm mại', card: '1.375rem', btn: '9999px' },
};

function toRelativeLuminance(rgb: RgbColor): number {
  const channel = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

export function getContrastRatio(hexA: string, hexB: string): number {
  const rgbA = hexToRgb(hexA);
  const rgbB = hexToRgb(hexB);
  if (!rgbA || !rgbB) return 1;
  const lumA = toRelativeLuminance(rgbA);
  const lumB = toRelativeLuminance(rgbB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

function blendRgb(from: RgbColor, to: RgbColor, t: number): string {
  const r = Math.round(from.r + (to.r - from.r) * t);
  const g = Math.round(from.g + (to.g - from.g) * t);
  const b = Math.round(from.b + (to.b - from.b) * t);
  const hex = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(b)}`.toUpperCase();
}

export function lightenHexForDarkMode(hex: string, surfaceHex = '#162849'): string {
  const base = hexToRgb(hex);
  if (!base) return '#93C5FD';
  const target: RgbColor = { r: 214, g: 232, b: 255 }; // Cool moonlight tint
  if (getContrastRatio(hex, surfaceHex) >= 5.2) return hex;
  for (let step = 1; step <= 20; step += 1) {
    const candidate = blendRgb(base, target, step / 20);
    if (getContrastRatio(candidate, surfaceHex) >= 5.2) {
      return candidate;
    }
  }
  return '#DBEAFE';
}

export function ensureReadableAccentText(
  accentHex: string,
  mode: ThemeMode,
  surfaceHex: string,
  inkFallback: string,
): string {
  if (mode === 'dark') {
    return lightenHexForDarkMode(accentHex, surfaceHex);
  }
  if (getContrastRatio(accentHex, surfaceHex) >= 4.6) {
    return accentHex;
  }
  const base = hexToRgb(accentHex);
  const ink = hexToRgb(inkFallback);
  if (!base || !ink) return inkFallback;
  for (let step = 1; step <= 20; step += 1) {
    const candidate = blendRgb(base, ink, step / 20);
    if (getContrastRatio(candidate, surfaceHex) >= 4.6) {
      return candidate;
    }
  }
  return inkFallback;
}

export interface ResolvedBackdropAsset {
  imagePath: string;
  isDarkHero: boolean;
  isCustom: boolean;
  blur: number;
  overlayStrength: number;
  position: 'top' | 'center' | 'bottom';
  fullPage: boolean;
}

export function getSkyBackdropAsset(
  appearance: AppearanceConfig,
  mode: ThemeMode,
): ResolvedBackdropAsset | null {
  const custom = appearance.customBackground;
  if (custom) {
    const activeUrl = custom.sameForBothModes
      ? (custom.darkImageUrl || custom.lightImageUrl).trim()
      : (mode === 'dark' ? custom.darkImageUrl : custom.lightImageUrl).trim();

    if (activeUrl) {
      return {
        imagePath: activeUrl,
        isDarkHero: mode === 'dark',
        isCustom: true,
        blur: custom.blur ?? 0,
        overlayStrength: custom.overlayStrength ?? 58,
        position: custom.position ?? 'center',
        fullPage: Boolean(custom.fullPage),
      };
    }
  }

  if (
    appearance.stylePreset === 'editorial' ||
    appearance.stylePreset === 'minimal' ||
    appearance.skyBackdrop === 'none'
  ) {
    return null;
  }

  const baseMeta = {
    isCustom: false,
    blur: 0,
    overlayStrength: 58,
    position: 'center' as const,
    fullPage: false,
  };

  if (mode === 'dark') {
    return { imagePath: 'themes/sky-night.jpg', isDarkHero: true, ...baseMeta };
  }

  if (appearance.skyBackdrop === 'pastel') {
    return { imagePath: 'themes/sky-pastel.jpg', isDarkHero: false, ...baseMeta };
  }

  if (appearance.skyBackdrop === 'horizon') {
    return { imagePath: 'themes/sky-horizon.jpg', isDarkHero: false, ...baseMeta };
  }

  return { imagePath: 'themes/sky-cumulus.jpg', isDarkHero: false, ...baseMeta };
}

export function getThemeStyle(
  appearance: AppearanceConfig,
  modeOverride?: ThemeMode,
): CSSProperties {
  const accent = hexToRgb(appearance.accentColor) ? appearance.accentColor : '#1558C0';
  const rgb = hexToRgb(accent) ?? { r: 21, g: 88, b: 192 };
  const font = FONT_PRESETS[appearance.fontPreset] ?? FONT_PRESETS.modern;
  const preset = STYLE_PRESETS[appearance.stylePreset] ?? STYLE_PRESETS.sky;
  const activeMode = modeOverride ?? appearance.mode;
  const tokens = activeMode === 'dark' ? preset.dark : preset.light;
  const radius = RADIUS_PRESETS[appearance.borderRadius] ?? RADIUS_PRESETS.soft;

  // Ensure accented labels meet AA contrast on subtle tinted surfaces as well as crisp white/dark cards
  const accentText = ensureReadableAccentText(
    accent,
    activeMode,
    tokens.subtle,
    tokens.inkPrimary,
  );

  return {
    '--accent': accent,
    '--accent-text': accentText,
    '--accent-soft': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.10)`,
    '--accent-border': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.28)`,
    '--accent-contrast': getContrastColor(accent),
    '--font-heading': font.heading,
    '--font-body': font.body,
    '--bg-canvas': tokens.canvas,
    '--sky-page-bg': tokens.skyPageBg,
    '--bg-surface': tokens.surface,
    '--bg-glass': tokens.glass,
    '--glass-bg': tokens.glassBg,
    '--glass-highlight': tokens.glassHighlight,
    '--shadow-glass': tokens.shadowGlass,
    '--bg-subtle': tokens.subtle,
    '--ink-primary': tokens.inkPrimary,
    '--ink-secondary': tokens.inkSecondary,
    '--ink-muted': tokens.inkMuted,
    '--border-subtle': tokens.borderSubtle,
    '--border-strong': tokens.borderStrong,
    '--shadow-card': tokens.shadowCard,
    '--radius-card': radius.card,
    '--radius-btn': radius.btn,
  } as CSSProperties;
}
