import { useState } from 'react';
import {
  Copy,
  EyeOff,
  ImagePlus,
  Layers,
  Plus,
  RotateCcw,
  Smile,
  Sparkles,
  Tag,
  Trash2,
} from 'lucide-react';
import {
  BADGE_PRESETS,
  BUILTIN_STICKERS,
  QUICK_EMOJI_STICKERS,
} from '../components/StickerAssets';
import type {
  CanvasSticker,
  PortfolioData,
  StickerAnimation,
  StickerKind,
} from '../types/portfolio';
import { createId } from '../utils/assets';
import { ImageUploader } from './ImageUploader';

interface StickerEditorProps {
  data: PortfolioData;
  canSaveLocally: boolean;
  selectedStickerId: string | null;
  onSelectSticker: (id: string | null) => void;
  onChange: (updater: (prev: PortfolioData) => PortfolioData) => void;
  onNotify?: (type: 'success' | 'error' | 'info', text: string) => void;
}

type AddTab = 'builtin' | 'upload' | 'badge' | 'emoji';

export function StickerEditor({
  data,
  canSaveLocally,
  selectedStickerId,
  onSelectSticker,
  onChange,
  onNotify,
}: StickerEditorProps) {
  const [addTab, setAddTab] = useState<AddTab>('builtin');
  const [customBadgeText, setCustomBadgeText] = useState('Hello! ✨');
  const [badgeBg, setBadgeBg] = useState('#FEF3C7');
  const [badgeTextColor, setBadgeTextColor] = useState('#78350F');
  const [customEmoji, setCustomEmoji] = useState('🌟');
  const [uploadStickerUrl, setUploadStickerUrl] = useState('');
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const stickers = data.appearance.stickers ?? [];
  const selected = stickers.find((s) => s.id === selectedStickerId) ?? null;

  const setStickers = (nextStickers: CanvasSticker[]) => {
    onChange((prev) => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        stickers: nextStickers,
      },
    }));
  };

  const addSticker = (partial: {
    kind: StickerKind;
    content: string;
    label?: string;
    bgColor?: string;
    textColor?: string;
    size?: number;
  }) => {
    const idx = stickers.length;
    const x = 76 - ((idx * 9) % 44);
    const y = 8 + ((idx * 6) % 28);
    const created: CanvasSticker = {
      id: createId('stk'),
      kind: partial.kind,
      content: partial.content,
      label: partial.label,
      bgColor: partial.bgColor,
      textColor: partial.textColor,
      x,
      y,
      size: partial.size ?? (partial.kind === 'badge' ? 76 : 74),
      rotation: 0,
      opacity: 1,
      layer: 'front',
      animation: 'float',
      hideOnMobile: false,
    };
    setStickers([...stickers, created]);
    onSelectSticker(created.id);
    onNotify?.('info', 'Đã gắn sticker! Hãy kéo thả trực tiếp trên khung Xem trước.');
  };

  const updateSelected = (patch: Partial<CanvasSticker>) => {
    if (!selected) return;
    setStickers(stickers.map((s) => (s.id === selected.id ? { ...s, ...patch } : s)));
  };

  const deleteSticker = (id: string) => {
    setStickers(stickers.filter((s) => s.id !== id));
    if (selectedStickerId === id) {
      onSelectSticker(null);
    }
  };

  const duplicateSticker = (id: string) => {
    const src = stickers.find((s) => s.id === id);
    if (!src) return;
    const copy: CanvasSticker = {
      ...src,
      id: createId('stk'),
      x: Math.min(96, src.x + 4),
      y: Math.min(97, src.y + 3),
    };
    setStickers([...stickers, copy]);
    onSelectSticker(copy.id);
  };

  const describeSticker = (s: CanvasSticker): string => {
    if (s.kind === 'builtin') {
      return BUILTIN_STICKERS.find((b) => b.id === s.content)?.label ?? s.content;
    }
    if (s.kind === 'badge') return `Nhãn "${s.content}"`;
    if (s.kind === 'emoji') return `Emoji ${s.content}`;
    return s.label || 'Ảnh sticker tải lên';
  };

  return (
    <div className="space-y-4">
      {/* Add Sticker Card */}
      <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
        <div>
          <h3 className="font-heading text-sm font-bold text-zinc-900">
            Trang trí &amp; Sticker tự do
          </h3>
          <p className="text-xs text-zinc-500">
            Chọn sticker để thả lên web, sau đó <strong>kéo thả, xoay góc, thu phóng</strong> trực
            tiếp trên khung Xem trước bên phải (không ảnh hưởng bản in CV A4).
          </p>
        </div>

        <div className="grid grid-cols-4 gap-1 rounded-lg bg-zinc-100 p-1 text-[11px] font-semibold">
          {(
            [
              { id: 'builtin', label: 'Vẽ sẵn', icon: Sparkles },
              { id: 'upload', label: 'Ảnh riêng', icon: ImagePlus },
              { id: 'badge', label: 'Nhãn chữ', icon: Tag },
              { id: 'emoji', label: 'Emoji', icon: Smile },
            ] as Array<{ id: AddTab; label: string; icon: typeof Sparkles }>
          ).map((tab) => {
            const Icon = tab.icon;
            const active = addTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setAddTab(tab.id)}
                className={`flex items-center justify-center gap-1 rounded-md py-1.5 transition ${
                  active ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {addTab === 'builtin' && (
          <div className="grid grid-cols-4 gap-2">
            {BUILTIN_STICKERS.map((item) => (
              <button
                key={item.id}
                type="button"
                title={`Thêm ${item.label}`}
                onClick={() =>
                  addSticker({ kind: 'builtin', content: item.id, label: item.label })
                }
                className="flex flex-col items-center gap-1 rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-2 text-center transition hover:border-blue-400 hover:bg-blue-50/50"
              >
                <div className="h-9 w-9">{item.render()}</div>
                <span className="line-clamp-1 text-[10px] font-medium text-zinc-600">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {addTab === 'upload' && (
          <div className="space-y-2.5">
            <ImageUploader
              label="Tải ảnh PNG nền trong suốt / GIF / SVG"
              value={uploadStickerUrl}
              canSaveLocally={canSaveLocally}
              onChange={(url) => setUploadStickerUrl(url)}
              onNotify={onNotify}
            />
            <button
              type="button"
              disabled={!uploadStickerUrl.trim()}
              onClick={() => {
                if (!uploadStickerUrl.trim()) return;
                addSticker({
                  kind: 'image',
                  content: uploadStickerUrl.trim(),
                  label: 'Sticker ảnh',
                  size: 88,
                });
              }}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
              Đặt ảnh này lên web
            </button>
          </div>
        )}

        {addTab === 'badge' && (
          <div className="space-y-2.5">
            <input
              type="text"
              maxLength={32}
              value={customBadgeText}
              onChange={(e) => setCustomBadgeText(e.target.value)}
              placeholder="VD: Hello!, Open for Ideas, 2026..."
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-blue-500"
            />
            <div className="flex flex-wrap gap-1.5">
              {BADGE_PRESETS.map((preset) => (
                <button
                  key={preset.content}
                  type="button"
                  onClick={() => {
                    setCustomBadgeText(preset.content);
                    setBadgeBg(preset.bgColor);
                    setBadgeTextColor(preset.textColor);
                  }}
                  style={{ backgroundColor: preset.bgColor, color: preset.textColor }}
                  className="rounded-md border border-black/10 px-2 py-1 text-[11px] font-semibold transition hover:opacity-85"
                >
                  {preset.content}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={!customBadgeText.trim()}
              onClick={() =>
                addSticker({
                  kind: 'badge',
                  content: customBadgeText.trim(),
                  bgColor: badgeBg,
                  textColor: badgeTextColor,
                  size: 72,
                })
              }
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm nhãn dán chữ
            </button>
          </div>
        )}

        {addTab === 'emoji' && (
          <div className="space-y-2.5">
            <div className="grid grid-cols-8 gap-1.5">
              {QUICK_EMOJI_STICKERS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => addSticker({ kind: 'emoji', content: em, size: 64 })}
                  className="flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-lg transition hover:border-blue-400 hover:bg-blue-50"
                >
                  {em}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={8}
                value={customEmoji}
                onChange={(e) => setCustomEmoji(e.target.value)}
                placeholder="Dán emoji khác..."
                className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-blue-500"
              />
              <button
                type="button"
                disabled={!customEmoji.trim()}
                onClick={() =>
                  addSticker({ kind: 'emoji', content: customEmoji.trim(), size: 64 })
                }
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-40"
              >
                Thêm
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Sticker Inspector */}
      {selected && (
        <div className="space-y-3 rounded-xl border border-blue-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h4 className="font-heading text-xs font-bold text-zinc-900">
                Đang chọn: {describeSticker(selected)}
              </h4>
              <p className="text-[11px] text-zinc-500">
                Kéo trực tiếp trên khung Xem trước hoặc tinh chỉnh thông số bên dưới.
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => duplicateSticker(selected.id)}
                title="Nhân bản"
                className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => deleteSticker(selected.id)}
                title="Xóa sticker này"
                className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {selected.kind === 'badge' && (
            <div className="space-y-2 rounded-lg bg-zinc-50 p-2.5">
              <input
                type="text"
                maxLength={32}
                value={selected.content}
                onChange={(e) => updateSelected({ content: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none focus:border-blue-500"
              />
              <div className="flex items-center gap-3 text-[11px] text-zinc-600">
                <label className="flex items-center gap-1.5">
                  <span>Nền:</span>
                  <input
                    type="color"
                    value={selected.bgColor || '#FEF3C7'}
                    onChange={(e) => updateSelected({ bgColor: e.target.value })}
                    className="h-6 w-8 cursor-pointer rounded border border-zinc-200"
                  />
                </label>
                <label className="flex items-center gap-1.5">
                  <span>Chữ:</span>
                  <input
                    type="color"
                    value={selected.textColor || '#78350F'}
                    onChange={(e) => updateSelected({ textColor: e.target.value })}
                    className="h-6 w-8 cursor-pointer rounded border border-zinc-200"
                  />
                </label>
              </div>
            </div>
          )}

          {selected.kind === 'emoji' && (
            <input
              type="text"
              maxLength={8}
              value={selected.content}
              onChange={(e) => updateSelected({ content: e.target.value })}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-blue-500"
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="flex justify-between text-[11px] font-semibold text-zinc-600">
                <span>Vị trí ngang (X)</span>
                <span className="font-mono">{selected.x}%</span>
              </span>
              <input
                type="range"
                min={2}
                max={98}
                step={0.5}
                value={selected.x}
                onChange={(e) => updateSelected({ x: Number.parseFloat(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </label>
            <label className="space-y-1">
              <span className="flex justify-between text-[11px] font-semibold text-zinc-600">
                <span>Vị trí dọc (Y)</span>
                <span className="font-mono">{selected.y}%</span>
              </span>
              <input
                type="range"
                min={1}
                max={99}
                step={0.5}
                value={selected.y}
                onChange={(e) => updateSelected({ y: Number.parseFloat(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </label>
            <label className="space-y-1">
              <span className="flex justify-between text-[11px] font-semibold text-zinc-600">
                <span>Kích thước</span>
                <span className="font-mono">{selected.size}px</span>
              </span>
              <input
                type="range"
                min={32}
                max={240}
                step={2}
                value={selected.size}
                onChange={(e) => updateSelected({ size: Number.parseInt(e.target.value, 10) })}
                className="w-full accent-blue-600"
              />
            </label>
            <label className="space-y-1">
              <span className="flex justify-between text-[11px] font-semibold text-zinc-600">
                <span>Độ mờ</span>
                <span className="font-mono">{Math.round(selected.opacity * 100)}%</span>
              </span>
              <input
                type="range"
                min={0.15}
                max={1}
                step={0.05}
                value={selected.opacity}
                onChange={(e) => updateSelected({ opacity: Number.parseFloat(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </label>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex-1 space-y-1">
              <span className="flex justify-between text-[11px] font-semibold text-zinc-600">
                <span>Xoay góc</span>
                <span className="font-mono">{selected.rotation}°</span>
              </span>
              <input
                type="range"
                min={-180}
                max={180}
                step={1}
                value={selected.rotation}
                onChange={(e) =>
                  updateSelected({ rotation: Number.parseInt(e.target.value, 10) })
                }
                className="w-full accent-blue-600"
              />
            </label>
            <button
              type="button"
              onClick={() => updateSelected({ rotation: 0 })}
              title="Đặt lại góc 0°"
              className="mt-4 rounded-lg border border-zinc-200 p-1.5 text-zinc-600 hover:bg-zinc-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => updateSelected({ layer: 'front' })}
              className={`flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-semibold ${
                selected.layer === 'front'
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <Layers className="h-3 w-3" />
              Nổi phía trên thẻ
            </button>
            <button
              type="button"
              onClick={() => updateSelected({ layer: 'behind' })}
              className={`flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-semibold ${
                selected.layer === 'behind'
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <Layers className="h-3 w-3 opacity-60" />
              Chìm sau thẻ kính
            </button>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-zinc-600">Hiệu ứng chuyển động</span>
            <div className="grid grid-cols-5 gap-1">
              {(
                [
                  { id: 'none', label: 'Tĩnh' },
                  { id: 'float', label: 'Trôi' },
                  { id: 'pulse', label: 'Nhịp' },
                  { id: 'wiggle', label: 'Lắc' },
                  { id: 'spin-slow', label: 'Xoay' },
                ] as Array<{ id: StickerAnimation; label: string }>
              ).map((anim) => (
                <button
                  key={anim.id}
                  type="button"
                  onClick={() => updateSelected({ animation: anim.id })}
                  className={`rounded-md border py-1 text-[11px] font-medium ${
                    selected.animation === anim.id
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  {anim.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-zinc-200/80 px-3 py-2 text-xs text-zinc-700">
            <span className="inline-flex items-center gap-1.5">
              <EyeOff className="h-3.5 w-3.5 text-zinc-400" />
              Ẩn trên điện thoại nhỏ (&lt; 640px)
            </span>
            <input
              type="checkbox"
              checked={Boolean(selected.hideOnMobile)}
              onChange={(e) => updateSelected({ hideOnMobile: e.target.checked })}
              className="h-4 w-4 rounded accent-blue-600"
            />
          </label>
        </div>
      )}

      {/* Placed Stickers List */}
      <div className="space-y-2.5 rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-zinc-900">
            Đã gắn trên trang ({stickers.length})
          </span>
          {stickers.length > 0 && (
            confirmClearAll ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setStickers([]);
                    onSelectSticker(null);
                    setConfirmClearAll(false);
                  }}
                  className="rounded-md bg-rose-600 px-2 py-0.5 text-[11px] font-semibold text-white"
                >
                  Xóa hết
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(false)}
                  className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-700"
                >
                  Hủy
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClearAll(true)}
                className="text-[11px] font-medium text-rose-600 hover:underline"
              >
                Xóa toàn bộ
              </button>
            )
          )}
        </div>

        {stickers.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-200 px-3 py-3 text-center text-xs text-zinc-500">
            Chưa có sticker nào. Hãy chọn một mẫu ở trên để bắt đầu trang trí!
          </p>
        ) : (
          <div className="space-y-1.5">
            {stickers.map((s) => {
              const active = s.id === selectedStickerId;
              return (
                <div
                  key={s.id}
                  onClick={() => onSelectSticker(s.id)}
                  className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs transition ${
                    active
                      ? 'border-blue-500 bg-blue-50/70 font-semibold text-blue-950'
                      : 'border-zinc-200/80 text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <span className="truncate">{describeSticker(s)}</span>
                  <div className="flex shrink-0 items-center gap-1.5 text-[10px] text-zinc-400">
                    <span>{s.layer === 'front' ? 'Trên' : 'Sau'}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSticker(s.id);
                      }}
                      className="rounded p-1 text-rose-500 hover:bg-rose-50"
                      aria-label="Xóa sticker"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
