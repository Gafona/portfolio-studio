import { type RefObject, useEffect, useRef, useState } from 'react';
import { Copy, Layers, RotateCw, Trash2 } from 'lucide-react';
import type { CanvasSticker, StickerAnimation, StickerLayer } from '../types/portfolio';
import { StickerVisual } from './StickerAssets';

interface StickerCanvasOverlayProps {
  stickers: CanvasSticker[];
  stageRef: RefObject<HTMLDivElement | null>;
  layer: StickerLayer;
  editable?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onUpdate?: (id: string, patch: Partial<CanvasSticker>) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

const ANIMATION_CLASS: Record<StickerAnimation, string> = {
  none: '',
  float: 'animate-float-gentle',
  pulse: 'animate-sticker-pulse',
  wiggle: 'animate-sticker-wiggle',
  'spin-slow': 'animate-spin-very-slow',
};

interface ActiveGesture {
  id: string;
  mode: 'move' | 'resize' | 'rotate';
  startX: number;
  startY: number;
  origX: number;
  origY: number;
  origSize: number;
  origRotation: number;
  centerX: number;
  centerY: number;
}

export function StickerCanvasOverlay({
  stickers,
  stageRef,
  layer,
  editable = false,
  selectedId = null,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
}: StickerCanvasOverlayProps) {
  const layerStickers = stickers.filter((s) => s.layer === layer);
  const [liveDraft, setLiveDraft] = useState<{
    id: string;
    x: number;
    y: number;
    size: number;
    rotation: number;
  } | null>(null);
  const gestureRef = useRef<ActiveGesture | null>(null);
  const draftRef = useRef<typeof liveDraft>(null);

  useEffect(() => {
    draftRef.current = liveDraft;
  }, [liveDraft]);

  useEffect(() => {
    if (!editable) return;

    const handlePointerMove = (e: PointerEvent) => {
      const g = gestureRef.current;
      const stage = stageRef.current;
      if (!g || !stage) return;

      const rect = stage.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      if (g.mode === 'move') {
        const dxPct = ((e.clientX - g.startX) / rect.width) * 100;
        const dyPct = ((e.clientY - g.startY) / rect.height) * 100;
        const nextX = Math.round(Math.min(98, Math.max(2, g.origX + dxPct)) * 10) / 10;
        const nextY = Math.round(Math.min(99, Math.max(1, g.origY + dyPct)) * 10) / 10;
        setLiveDraft({ id: g.id, x: nextX, y: nextY, size: g.origSize, rotation: g.origRotation });
      } else if (g.mode === 'resize') {
        const delta = Math.max(e.clientX - g.startX, e.clientY - g.startY);
        const nextSize = Math.round(Math.min(240, Math.max(32, g.origSize + delta * 1.4)));
        setLiveDraft({ id: g.id, x: g.origX, y: g.origY, size: nextSize, rotation: g.origRotation });
      } else if (g.mode === 'rotate') {
        const rad = Math.atan2(e.clientY - g.centerY, e.clientX - g.centerX);
        let deg = Math.round((rad * 180) / Math.PI + 90);
        if (deg > 180) deg -= 360;
        if (deg < -180) deg += 360;
        setLiveDraft({ id: g.id, x: g.origX, y: g.origY, size: g.origSize, rotation: deg });
      }
    };

    const handlePointerUp = () => {
      const g = gestureRef.current;
      const d = draftRef.current;
      gestureRef.current = null;
      if (g && d && d.id === g.id) {
        onUpdate?.(g.id, {
          x: d.x,
          y: d.y,
          size: d.size,
          rotation: d.rotation,
        });
      }
      setLiveDraft(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [editable, onUpdate, stageRef]);

  if (layerStickers.length === 0) return null;

  const zIndexClass =
    layer === 'behind' ? 'z-[5]' : editable ? 'z-30' : 'z-20';

  const startGesture = (
    e: React.PointerEvent,
    sticker: CanvasSticker,
    mode: ActiveGesture['mode'],
  ) => {
    if (!editable) return;
    e.stopPropagation();
    e.preventDefault();
    onSelect?.(sticker.id);

    const stageRect = stageRef.current?.getBoundingClientRect();
    const centerX = stageRect ? stageRect.left + (sticker.x / 100) * stageRect.width : e.clientX;
    const centerY = stageRect ? stageRect.top + (sticker.y / 100) * stageRect.height : e.clientY;

    gestureRef.current = {
      id: sticker.id,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      origX: sticker.x,
      origY: sticker.y,
      origSize: sticker.size,
      origRotation: sticker.rotation,
      centerX,
      centerY,
    };
    setLiveDraft({
      id: sticker.id,
      x: sticker.x,
      y: sticker.y,
      size: sticker.size,
      rotation: sticker.rotation,
    });
  };

  return (
    <div
      className={`no-print pointer-events-none absolute inset-0 ${zIndexClass}`}
      aria-hidden={!editable}
    >
      {layerStickers.map((sticker) => {
        const draft = liveDraft && liveDraft.id === sticker.id ? liveDraft : null;
        const x = draft ? draft.x : sticker.x;
        const y = draft ? draft.y : sticker.y;
        const size = draft ? draft.size : sticker.size;
        const rotation = draft ? draft.rotation : sticker.rotation;
        const isSelected = editable && selectedId === sticker.id;
        const animClass = ANIMATION_CLASS[sticker.animation] ?? '';

        const hiddenMobileClass = !editable && sticker.hideOnMobile ? 'hidden sm:block' : '';
        const dimHiddenInStudio = editable && sticker.hideOnMobile ? 'ring-1 ring-amber-400/50' : '';

        return (
          <div
            key={sticker.id}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: sticker.kind === 'badge' ? 'auto' : `${size}px`,
              height: sticker.kind === 'badge' ? 'auto' : `${size}px`,
              opacity: sticker.opacity,
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            }}
            onClick={(e) => {
              if (!editable) return;
              e.stopPropagation();
              onSelect?.(sticker.id);
            }}
            onPointerDown={(e) => startGesture(e, sticker, 'move')}
            className={`absolute ${hiddenMobileClass} ${
              editable
                ? `pointer-events-auto cursor-grab touch-none select-none active:cursor-grabbing ${
                    isSelected
                      ? 'rounded-xl ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent'
                      : 'hover:ring-2 hover:ring-blue-400/60 hover:rounded-xl'
                  } ${dimHiddenInStudio}`
                : 'pointer-events-none select-none'
            }`}
          >
            <div className={`h-full w-full ${animClass}`}>
              <StickerVisual sticker={{ ...sticker, size }} />
            </div>

            {isSelected && (
              <>
                {/* Top Rotate Handle */}
                <button
                  type="button"
                  onPointerDown={(e) => startGesture(e, sticker, 'rotate')}
                  title="Kéo để xoay góc"
                  aria-label="Xoay sticker"
                  className="absolute -top-7 left-1/2 flex h-5 w-5 -translate-x-1/2 cursor-grab items-center justify-center rounded-full border border-blue-500 bg-white text-blue-600 shadow-sm active:cursor-grabbing"
                >
                  <RotateCw className="h-3 w-3" />
                </button>

                {/* Bottom-Right Resize Handle */}
                <button
                  type="button"
                  onPointerDown={(e) => startGesture(e, sticker, 'resize')}
                  title="Kéo để phóng to / thu nhỏ"
                  aria-label="Đổi kích thước sticker"
                  className="absolute -right-2 -bottom-2 h-4 w-4 cursor-nwse-resize rounded-full border-2 border-white bg-blue-600 shadow-sm"
                />

                {/* Quick Action Pill */}
                <div
                  onPointerDown={(e) => e.stopPropagation()}
                  style={{ transform: `rotate(${-rotation}deg)` }}
                  className="absolute -bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-full border border-zinc-200 bg-white/95 px-1.5 py-0.5 text-zinc-700 shadow-md backdrop-blur-sm"
                >
                  <button
                    type="button"
                    onClick={() =>
                      onUpdate?.(sticker.id, {
                        layer: sticker.layer === 'front' ? 'behind' : 'front',
                      })
                    }
                    title={sticker.layer === 'front' ? 'Đưa ra sau chữ/thẻ' : 'Đưa lên phía trên'}
                    className="rounded-full p-1 hover:bg-zinc-100"
                  >
                    <Layers className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDuplicate?.(sticker.id)}
                    title="Nhân bản sticker"
                    className="rounded-full p-1 hover:bg-zinc-100"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete?.(sticker.id)}
                    title="Xóa sticker"
                    className="rounded-full p-1 text-rose-500 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
