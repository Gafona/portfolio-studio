import { useRef, useState } from 'react';
import { ImagePlus, Link2, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { registerPreviewAsset, resolveAssetUrl } from '../utils/assets';
import {
  isGitHubPublishConfigured,
  loadGitHubSyncConfig,
  uploadImageToGitHub,
} from '../utils/githubPublish';

interface ImageUploaderProps {
  label: string;
  value: string;
  canSaveLocally: boolean;
  onChange: (nextValue: string) => void;
  onNotify?: (type: 'success' | 'error' | 'info', text: string) => void;
}

const MAX_INLINE_DATAURL_BYTES = 150 * 1024;

export function ImageUploader({
  label,
  value,
  canSaveLocally,
  onChange,
  onNotify,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const previewUrl = resolveAssetUrl(value);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onNotify?.('error', 'Vui lòng chọn tệp hình ảnh (PNG, JPG, WEBP, GIF, SVG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onNotify?.('error', 'Kích thước ảnh tối đa là 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) {
        onNotify?.('error', 'Không thể đọc tệp ảnh.');
        return;
      }

      if (canSaveLocally) {
        setUploading(true);
        try {
          const response = await fetch('/__studio/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: file.name || 'pasted-image.png', dataUrl }),
          });
          const result = (await response.json()) as {
            ok?: boolean;
            path?: string;
            error?: string;
          };

          if (!response.ok || !result.ok || !result.path) {
            onNotify?.('error', result.error ?? 'Tải ảnh lên thất bại.');
            return;
          }

          onChange(result.path);
          onNotify?.('success', `Đã lưu ảnh vào ${result.path}`);
        } catch {
          onNotify?.('error', 'Lỗi kết nối khi tải ảnh lên máy cục bộ.');
        } finally {
          setUploading(false);
        }
        return;
      }

      const ghConfig = loadGitHubSyncConfig();
      if (isGitHubPublishConfigured(ghConfig)) {
        setUploading(true);
        try {
          const result = await uploadImageToGitHub(
            ghConfig,
            file.name || 'pasted-image.png',
            dataUrl,
          );
          if (!result.ok || !result.path) {
            onNotify?.('error', result.error ?? 'Tải ảnh trực tiếp lên GitHub thất bại.');
            return;
          }
          registerPreviewAsset(result.path, dataUrl);
          onChange(result.path);
          onNotify?.(
            'success',
            `Đã tải ảnh lên GitHub (${result.path}). Bấm "Đăng lên Web" khi chỉnh xong.`,
          );
        } finally {
          setUploading(false);
        }
        return;
      }

      if (file.size > MAX_INLINE_DATAURL_BYTES) {
        onNotify?.(
          'error',
          'Chưa kết nối GitHub: ảnh nhúng trực tiếp nên dưới 150KB, hoặc vào mục Dữ liệu kết nối GitHub để tải ảnh tới 5MB.',
        );
        return;
      }

      onChange(dataUrl);
      onNotify?.('info', 'Đã gắn ảnh tạm thời vào bản nháp trình duyệt.');
    };

    reader.readAsDataURL(file);
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) {
      await processFile(file);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handlePaste = async (event: React.ClipboardEvent<HTMLDivElement>) => {
    const items = event.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          event.preventDefault();
          await processFile(file);
          return;
        }
      }
    }
  };

  return (
    <div className="space-y-1.5" onPaste={handlePaste}>
      <label className="block text-xs font-semibold text-zinc-700">{label}</label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col gap-2.5 rounded-xl border p-3 transition ${
          dragging
            ? 'border-blue-500 bg-blue-50/70'
            : 'border-zinc-200 bg-zinc-50/70'
        }`}
      >
        <div className="flex items-center gap-3">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={label}
              className="h-14 w-14 shrink-0 rounded-lg border border-zinc-200 bg-white object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white text-zinc-400">
              {dragging ? (
                <UploadCloud className="h-5 w-5 text-blue-500" />
              ) : (
                <ImagePlus className="h-5 w-5" />
              )}
            </div>
          )}

          <div className="flex flex-1 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                onChange={handleFileSelected}
                className="hidden"
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ImagePlus className="h-3.5 w-3.5" />
                )}
                <span>{uploading ? 'Đang tải...' : 'Chọn hoặc kéo thả ảnh'}</span>
              </button>

              {value && (
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Xóa</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-zinc-500">
              Hỗ trợ kéo thả tệp hoặc dán ảnh trực tiếp (<kbd className="font-mono">Ctrl+V</kbd>)
            </p>
          </div>
        </div>

        <div className="relative flex items-center">
          <Link2 className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Hoặc dán URL ảnh (https://...) hoặc uploads/ten-anh.png"
            className="w-full rounded-lg border border-zinc-200 bg-white py-1.5 pr-3 pl-8 text-xs text-zinc-800 outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
