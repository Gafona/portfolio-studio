import type { ReactNode } from 'react';
import type { CanvasSticker } from '../types/portfolio';
import { resolveAssetUrl } from '../utils/assets';

export interface BuiltinStickerDef {
  id: string;
  label: string;
  render: () => ReactNode;
}

export const BUILTIN_STICKERS: BuiltinStickerDef[] = [
  {
    id: 'cloud-cute',
    label: 'Mây mỉm cười',
    render: () => (
      <svg viewBox="0 0 120 84" className="h-full w-full drop-shadow-md">
        <defs>
          <linearGradient id="stkCloud" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#DBEAFE" />
          </linearGradient>
        </defs>
        <path
          d="M24 68 H92 C104 68 112 60 112 49 C112 39 104 31 94 31 C92 17 79 8 64 8 C48 8 35 18 33 32 C20 33 10 42 10 53 C10 62 16 68 24 68 Z"
          fill="url(#stkCloud)"
          stroke="#93C5FD"
          strokeWidth="2.5"
        />
        <circle cx="46" cy="43" r="3" fill="#1E3A8A" />
        <circle cx="72" cy="43" r="3" fill="#1E3A8A" />
        <ellipse cx="38" cy="49" rx="4.5" ry="2.5" fill="#FDA4AF" opacity="0.8" />
        <ellipse cx="80" cy="49" rx="4.5" ry="2.5" fill="#FDA4AF" opacity="0.8" />
        <path
          d="M52 49 Q59 55 66 49"
          fill="none"
          stroke="#1E3A8A"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 'star-cluster',
    label: 'Chùm sao lấp lánh',
    render: () => (
      <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md">
        <path
          d="M52 10 L59 38 L87 45 L59 52 L52 80 L45 52 L17 45 L45 38 Z"
          fill="#FDE047"
          stroke="#F59E0B"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M23 16 L26 24 L34 27 L26 30 L23 38 L20 30 L12 27 L20 24 Z"
          fill="#BAE6FD"
        />
        <path
          d="M80 64 L82.5 71 L89.5 73.5 L82.5 76 L80 83 L77.5 76 L70.5 73.5 L77.5 71 Z"
          fill="#FDE68A"
        />
      </svg>
    ),
  },
  {
    id: 'crescent-moon',
    label: 'Trăng khuyết ngủ ngon',
    render: () => (
      <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md">
        <defs>
          <linearGradient id="stkMoon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        <path
          d="M66 16 A36 36 0 1 0 86 72 A28 28 0 1 1 66 16 Z"
          fill="url(#stkMoon)"
          stroke="#D97706"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M72 30 L75 37 L82 40 L75 43 L72 50 L69 43 L62 40 L69 37 Z" fill="#E0F2FE" />
      </svg>
    ),
  },
  {
    id: 'paper-plane',
    label: 'Máy bay giấy',
    render: () => (
      <svg viewBox="0 0 110 90" className="h-full w-full drop-shadow-md">
        <path
          d="M12 44 L96 14 L64 76 L47 53 Z"
          fill="#FFFFFF"
          stroke="#60A5FA"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path d="M47 53 L96 14 L56 64 Z" fill="#93C5FD" />
        <path
          d="M10 72 Q26 66 36 58"
          fill="none"
          stroke="#BAE6FD"
          strokeWidth="2.5"
          strokeDasharray="4 4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 'washi-tape',
    label: 'Băng keo Washi',
    render: () => (
      <svg viewBox="0 0 140 52" className="h-full w-full drop-shadow-sm">
        <polygon
          points="8,8 132,6 126,20 134,32 128,44 6,46 12,33 5,20"
          fill="#BAE6FD"
          fillOpacity="0.88"
          stroke="#60A5FA"
          strokeWidth="1.6"
        />
        <circle cx="32" cy="26" r="3" fill="#FFFFFF" opacity="0.7" />
        <circle cx="56" cy="26" r="3" fill="#FFFFFF" opacity="0.7" />
        <circle cx="80" cy="26" r="3" fill="#FFFFFF" opacity="0.7" />
        <circle cx="104" cy="26" r="3" fill="#FFFFFF" opacity="0.7" />
      </svg>
    ),
  },
  {
    id: 'flower-bloom',
    label: 'Hoa mai 5 cánh',
    render: () => (
      <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md">
        <g fill="#FBCFE8" stroke="#EC4899" strokeWidth="1.8">
          <circle cx="50" cy="24" r="16" />
          <circle cx="75" cy="42" r="16" />
          <circle cx="66" cy="70" r="16" />
          <circle cx="34" cy="70" r="16" />
          <circle cx="25" cy="42" r="16" />
        </g>
        <circle cx="50" cy="50" r="13" fill="#FDE047" stroke="#F59E0B" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'heart-sparkle',
    label: 'Tim lấp lánh',
    render: () => (
      <svg viewBox="0 0 100 94" className="h-full w-full drop-shadow-md">
        <path
          d="M50 82 C20 62 12 42 14 28 C16 14 32 10 44 20 C47 22.5 49 25 50 28 C51 25 53 22.5 56 20 C68 10 84 14 86 28 C88 42 80 62 50 82 Z"
          fill="#FB7185"
          stroke="#FFFFFF"
          strokeWidth="2.5"
        />
        <path d="M27 25 Q32 20 37 23" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'coffee-cup',
    label: 'Ly cà phê ấm',
    render: () => (
      <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md">
        <path d="M36 20 Q32 12 38 7" fill="none" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
        <path d="M54 20 Q50 11 56 6" fill="none" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
        <path
          d="M72 40 H80 C86 40 90 44 90 50 C90 56 86 60 80 60 H72"
          fill="none"
          stroke="#F8FAFC"
          strokeWidth="5"
        />
        <path
          d="M22 34 H74 V56 C74 71 62 82 48 82 C34 82 22 71 22 56 Z"
          fill="#FEF3C7"
          stroke="#D97706"
          strokeWidth="2.5"
        />
        <ellipse cx="48" cy="34" rx="26" ry="6" fill="#92400E" stroke="#D97706" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'butterfly',
    label: 'Bươm bướm xanh',
    render: () => (
      <svg viewBox="0 0 100 90" className="h-full w-full drop-shadow-md">
        <path
          d="M48 44 C32 14 8 18 14 40 C17 50 32 52 46 48 C30 56 20 72 32 78 C42 82 47 64 49 52 Z"
          fill="#7DD3FC"
          stroke="#0284C7"
          strokeWidth="2"
        />
        <path
          d="M52 44 C68 14 92 18 86 40 C83 50 68 52 54 48 C70 56 80 72 68 78 C58 82 53 64 51 52 Z"
          fill="#7DD3FC"
          stroke="#0284C7"
          strokeWidth="2"
        />
        <rect x="47.5" y="28" width="5" height="38" rx="2.5" fill="#1E3A8A" />
      </svg>
    ),
  },
  {
    id: 'sun-warm',
    label: 'Mặt trời rạng rỡ',
    render: () => (
      <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md">
        <circle cx="50" cy="50" r="22" fill="#FDE047" stroke="#F59E0B" strokeWidth="2.4" />
        <g stroke="#FBBF24" strokeWidth="4" strokeLinecap="round">
          <line x1="50" y1="10" x2="50" y2="20" />
          <line x1="50" y1="80" x2="50" y2="90" />
          <line x1="10" y1="50" x2="20" y2="50" />
          <line x1="80" y1="50" x2="90" y2="50" />
          <line x1="22" y1="22" x2="29" y2="29" />
          <line x1="71" y1="71" x2="78" y2="78" />
          <line x1="78" y1="22" x2="71" y2="29" />
          <line x1="29" y1="71" x2="22" y2="78" />
        </g>
      </svg>
    ),
  },
  {
    id: 'crown-mini',
    label: 'Vương miện vàng',
    render: () => (
      <svg viewBox="0 0 110 80" className="h-full w-full drop-shadow-md">
        <path
          d="M14 64 L10 24 L35 42 L55 16 L75 42 L100 24 L96 64 Z"
          fill="#FDE047"
          stroke="#D97706"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <circle cx="55" cy="14" r="5" fill="#F59E0B" />
        <circle cx="10" cy="22" r="4" fill="#F59E0B" />
        <circle cx="100" cy="22" r="4" fill="#F59E0B" />
      </svg>
    ),
  },
  {
    id: 'rainbow-pastel',
    label: 'Cầu vồng pastel',
    render: () => (
      <svg viewBox="0 0 120 76" className="h-full w-full drop-shadow-md">
        <path d="M16 62 A44 44 0 0 1 104 62" fill="none" stroke="#FDA4AF" strokeWidth="8" strokeLinecap="round" />
        <path d="M24 62 A36 36 0 0 1 96 62" fill="none" stroke="#FDE68A" strokeWidth="8" strokeLinecap="round" />
        <path d="M32 62 A28 28 0 0 1 88 62" fill="none" stroke="#93C5FD" strokeWidth="8" strokeLinecap="round" />
      </svg>
    ),
  },
];

export const QUICK_EMOJI_STICKERS = [
  '✨',
  '☁️',
  '🌙',
  '🌸',
  '🎀',
  '☕',
  '🚀',
  '🎨',
  '📚',
  '💼',
  '🦋',
  '💡',
  '🌿',
  '⭐',
  '💫',
  '🎯',
];

export interface BadgePresetDef {
  content: string;
  bgColor: string;
  textColor: string;
}

export const BADGE_PRESETS: BadgePresetDef[] = [
  { content: 'Hello! ✨', bgColor: '#FEF3C7', textColor: '#92400E' },
  { content: 'Made with ♥', bgColor: '#FFE4E6', textColor: '#9F1239' },
  { content: '2026 Journey', bgColor: '#DBEAFE', textColor: '#1E3A8A' },
  { content: 'Keep Shining', bgColor: '#E0E7FF', textColor: '#3730A3' },
  { content: 'Open to Connect', bgColor: '#D1FAE5', textColor: '#065F46' },
  { content: 'My Workspace', bgColor: '#F3F4F6', textColor: '#1F2937' },
];

export function StickerVisual({ sticker }: { sticker: CanvasSticker }) {
  if (sticker.kind === 'image') {
    const src = resolveAssetUrl(sticker.content);
    if (!src) return null;
    return (
      <img
        src={src}
        alt={sticker.label || 'Sticker'}
        draggable={false}
        className="pointer-events-none h-full w-full object-contain drop-shadow-md select-none"
      />
    );
  }

  if (sticker.kind === 'emoji') {
    const fontSize = Math.max(20, Math.round(sticker.size * 0.72));
    return (
      <span
        aria-hidden="true"
        className="pointer-events-none flex h-full w-full items-center justify-center leading-none drop-shadow-sm select-none"
        style={{ fontSize: `${fontSize}px` }}
      >
        {sticker.content}
      </span>
    );
  }

  if (sticker.kind === 'badge') {
    const bg = sticker.bgColor || '#FEF3C7';
    const fg = sticker.textColor || '#78350F';
    const fontSize = Math.max(11, Math.min(24, Math.round(sticker.size * 0.19)));
    return (
      <div
        className="pointer-events-none relative inline-flex items-center justify-center rounded-xl border border-black/10 px-3.5 py-2 font-heading font-bold whitespace-nowrap shadow-md select-none"
        style={{
          backgroundColor: bg,
          color: fg,
          fontSize: `${fontSize}px`,
        }}
      >
        <span
          aria-hidden="true"
          className="absolute -top-1.5 left-1/2 h-2.5 w-8 -translate-x-1/2 rounded-sm bg-white/65 shadow-xs backdrop-blur-xs"
        />
        <span>{sticker.content}</span>
      </div>
    );
  }

  const builtin = BUILTIN_STICKERS.find((item) => item.id === sticker.content) ?? BUILTIN_STICKERS[0];
  return (
    <div className="pointer-events-none h-full w-full select-none">
      {builtin.render()}
    </div>
  );
}
