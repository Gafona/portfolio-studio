import { ArrowDown, ArrowUp, Moon, Palette, Sun, Trash2 } from 'lucide-react';
import type {
  BackgroundPosition,
  BorderRadiusScale,
  CustomBackgroundConfig,
  CvFontScale,
  CvSectionKey,
  CvSettingsConfig,
  CvTemplate,
  FontPreset,
  HeroLayout,
  HomeSectionKey,
  HomeSectionsConfig,
  PortfolioData,
  PortfolioLayout,
  SkyBackdrop,
  StylePreset,
} from '../types/portfolio';
import { moveItem } from '../utils/assets';
import {
  DEFAULT_CUSTOM_BACKGROUND,
  DEFAULT_CV_SECTION_ORDER,
  DEFAULT_HOME_SECTION_ORDER,
} from '../utils/normalize';
import {
  ACCENT_PRESETS,
  FONT_PRESETS,
  RADIUS_PRESETS,
  STYLE_PRESETS,
} from '../utils/theme';
import { ImageUploader } from './ImageUploader';

interface AppearanceEditorProps {
  mode: 'site' | 'cv';
  data: PortfolioData;
  canSaveLocally?: boolean;
  onChange: (updater: (prev: PortfolioData) => PortfolioData) => void;
  onNotify?: (type: 'success' | 'error' | 'info', text: string) => void;
}

const HOME_SECTION_META: Record<
  HomeSectionKey,
  { toggleKey: keyof HomeSectionsConfig; label: string }
> = {
  highlights: { toggleKey: 'showHighlights', label: 'Các con số nổi bật' },
  story: { toggleKey: 'showStory', label: 'Đôi nét về mình' },
  timeline: { toggleKey: 'showTimelinePreview', label: 'Dòng thời gian Portfolio' },
  skills: { toggleKey: 'showSkills', label: 'Kỹ năng chính' },
  contact: { toggleKey: 'showContact', label: 'Khối Liên hệ nhanh' },
};

const CV_SECTION_META: Record<
  CvSectionKey,
  { toggleKey: keyof CvSettingsConfig; label: string }
> = {
  summary: { toggleKey: 'showSummary', label: 'Tóm tắt chuyên môn' },
  experience: { toggleKey: 'showExperience', label: 'Kinh nghiệm làm việc' },
  projects: { toggleKey: 'showProjects', label: 'Dự án tiêu biểu' },
  skills: { toggleKey: 'showSkills', label: 'Kỹ năng' },
  education: { toggleKey: 'showEducation', label: 'Học vấn' },
  achievements: { toggleKey: 'showAchievements', label: 'Thành tích & Chứng chỉ' },
};

export function AppearanceEditor({
  mode,
  data,
  canSaveLocally = false,
  onChange,
  onNotify,
}: AppearanceEditorProps) {
  const { appearance } = data;

  const updateAppearance = <K extends keyof PortfolioData['appearance']>(
    key: K,
    value: PortfolioData['appearance'][K],
  ) => {
    onChange((prev) => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [key]: value,
      },
    }));
  };

  if (mode === 'cv') {
    const cvOrder = appearance.cvSettings.sectionOrder ?? DEFAULT_CV_SECTION_ORDER;

    return (
      <div className="space-y-4">
        <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
          <div>
            <h3 className="font-heading text-sm font-bold text-zinc-900">
              Mẫu bố cục CV (Khổ A4)
            </h3>
            <p className="text-xs text-zinc-500">
              CV luôn giữ nền giấy trắng rõ nét để xuất PDF chuyên nghiệp.
            </p>
          </div>

          <div className="space-y-2">
            {(
              [
                {
                  id: 'classic',
                  label: '1 cột chuẩn ATS',
                  desc: 'Trình bày truyền thống, dễ quét tự động và đọc nhanh',
                },
                {
                  id: 'modern-split',
                  label: '2 cột hiện đại',
                  desc: 'Cột trái kỹ năng/học vấn, cột phải kinh nghiệm/dự án',
                },
                {
                  id: 'executive',
                  label: 'Executive Thụy Sĩ',
                  desc: 'Tiêu đề căn giữa tinh tế, nhãn mục cột trái 25%',
                },
              ] as Array<{ id: CvTemplate; label: string; desc: string }>
            ).map((tpl) => {
              const active = appearance.cvSettings.template === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() =>
                    updateAppearance('cvSettings', {
                      ...appearance.cvSettings,
                      template: tpl.id,
                    })
                  }
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    active
                      ? 'border-blue-500 bg-blue-50/70 text-blue-950'
                      : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <p className="text-xs font-bold">{tpl.label}</p>
                  <p className="mt-0.5 text-[11px] opacity-75">{tpl.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
          <h3 className="font-heading text-sm font-bold text-zinc-900">
            Cỡ chữ &amp; Tùy chọn trang in
          </h3>

          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'sm', label: 'Nhỏ (12.5px)' },
                { id: 'md', label: 'Chuẩn (13.5px)' },
                { id: 'lg', label: 'Lớn (14.5px)' },
              ] as Array<{ id: CvFontScale; label: string }>
            ).map((scale) => {
              const active = (appearance.cvSettings.fontScale ?? 'md') === scale.id;
              return (
                <button
                  key={scale.id}
                  type="button"
                  onClick={() =>
                    updateAppearance('cvSettings', {
                      ...appearance.cvSettings,
                      fontScale: scale.id,
                    })
                  }
                  className={`rounded-lg border px-2.5 py-2 text-xs font-semibold transition ${
                    active
                      ? 'border-blue-500 bg-blue-50/70 text-blue-900'
                      : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  {scale.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-1.5 pt-1">
            {(
              [
                { key: 'showAvatar', label: 'Hiện ảnh đại diện trên CV' },
                { key: 'accentOnCV', label: 'Dùng màu chủ đạo làm điểm nhấn CV' },
                { key: 'compactMode', label: 'Chế độ gọn (Compact — dễ vừa 1 trang A4)' },
              ] as Array<{ key: keyof CvSettingsConfig; label: string }>
            ).map((opt) => (
              <label
                key={opt.key}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-zinc-200/80 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
              >
                <span>{opt.label}</span>
                <input
                  type="checkbox"
                  checked={Boolean(appearance.cvSettings[opt.key])}
                  onChange={(e) =>
                    updateAppearance('cvSettings', {
                      ...appearance.cvSettings,
                      [opt.key]: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded accent-blue-600"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2.5 rounded-xl border border-zinc-200 bg-white p-4">
          <div>
            <h3 className="font-heading text-sm font-bold text-zinc-900">
              Thứ tự &amp; Ẩn/Hiện các mục trên CV
            </h3>
            <p className="text-xs text-zinc-500">
              Sắp xếp thứ tự mục nào lên trước tùy vị trí ứng tuyển.
            </p>
          </div>

          <div className="space-y-1.5">
            {cvOrder.map((key, idx) => {
              const meta = CV_SECTION_META[key];
              if (!meta) return null;
              return (
                <div
                  key={key}
                  className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200/80 px-3 py-2"
                >
                  <label className="flex flex-1 cursor-pointer items-center gap-2 text-xs font-medium text-zinc-800">
                    <input
                      type="checkbox"
                      checked={Boolean(appearance.cvSettings[meta.toggleKey])}
                      onChange={(e) =>
                        updateAppearance('cvSettings', {
                          ...appearance.cvSettings,
                          [meta.toggleKey]: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded accent-blue-600"
                    />
                    <span>{meta.label}</span>
                  </label>

                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() =>
                        updateAppearance('cvSettings', {
                          ...appearance.cvSettings,
                          sectionOrder: moveItem(cvOrder, idx, -1),
                        })
                      }
                      className="rounded p-1 text-zinc-400 hover:bg-zinc-100 disabled:opacity-30"
                      aria-label={`Đưa ${meta.label} lên`}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === cvOrder.length - 1}
                      onClick={() =>
                        updateAppearance('cvSettings', {
                          ...appearance.cvSettings,
                          sectionOrder: moveItem(cvOrder, idx, 1),
                        })
                      }
                      className="rounded p-1 text-zinc-400 hover:bg-zinc-100 disabled:opacity-30"
                      aria-label={`Đưa ${meta.label} xuống`}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const rawHomeOrder = appearance.homeSectionOrder ?? DEFAULT_HOME_SECTION_ORDER;
  const homeOrder = rawHomeOrder.filter((k): k is HomeSectionKey => k in HOME_SECTION_META);
  const isSkyPreset =
    appearance.stylePreset === 'sky' || appearance.stylePreset === 'sky-pastel';

  return (
    <div className="space-y-4">
      {/* Visual Style Presets */}
      <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
        <div>
          <h3 className="font-heading text-sm font-bold text-zinc-900">
            Concept &amp; Bảng màu
          </h3>
          <p className="text-xs text-zinc-500">
            Chọn phong cách bầu trời mây hoặc giao diện tối giản.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(STYLE_PRESETS) as StylePreset[]).map((key) => {
            const preset = STYLE_PRESETS[key];
            const active = appearance.stylePreset === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                    appearance: {
                      ...prev.appearance,
                      stylePreset: key,
                      mode: preset.defaultMode,
                      skyBackdrop: preset.defaultSkyBackdrop,
                    },
                  }))
                }
                className={`rounded-xl border p-3 text-left transition ${
                  active
                    ? 'border-blue-500 bg-blue-50/60'
                    : 'border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                <div className="mb-2 flex items-center gap-1.5">
                  {preset.swatches.map((hex, i) => (
                    <span
                      key={i}
                      className="h-4 w-4 rounded-full border border-zinc-300/80"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
                <p className="text-xs font-bold text-zinc-900">{preset.label}</p>
                <p className="mt-0.5 line-clamp-2 text-[11px] text-zinc-500">
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>

        {isSkyPreset && (
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-semibold text-zinc-700">
              Nền bầu trời (chế độ Ban ngày — Ban đêm tự chuyển Trời sao)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'cumulus', label: 'Mây nắng xanh' },
                  { id: 'pastel', label: 'Mây màu nước' },
                  { id: 'horizon', label: 'Mây đường chân trời' },
                  { id: 'none', label: 'Chỉ dùng nền trơn' },
                ] as Array<{ id: SkyBackdrop; label: string }>
              ).map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => updateAppearance('skyBackdrop', bg.id)}
                  className={`rounded-lg border px-2.5 py-2 text-xs font-medium transition ${
                    (appearance.skyBackdrop ?? 'cumulus') === bg.id
                      ? 'border-blue-500 bg-blue-50/70 text-blue-900'
                      : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  {bg.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Wallpaper / Backdrop Image */}
        {(() => {
          const customBg: CustomBackgroundConfig = {
            ...DEFAULT_CUSTOM_BACKGROUND,
            ...(appearance.customBackground ?? {}),
          };
          const updateCustomBg = (patch: Partial<CustomBackgroundConfig>) => {
            updateAppearance('customBackground', { ...customBg, ...patch });
          };
          const sharedUrl = customBg.darkImageUrl || customBg.lightImageUrl;
          const hasAnyCustomBg = Boolean(
            customBg.darkImageUrl.trim() || customBg.lightImageUrl.trim(),
          );

          return (
            <div className="space-y-3 rounded-xl border border-zinc-200/90 bg-zinc-50/60 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-zinc-800">
                    Ảnh nền tùy chỉnh (Đổi hình nền web)
                  </span>
                  <p className="text-[11px] text-zinc-500">
                    Tải ảnh của bạn hoặc dán URL thay cho nền mây mặc định.
                  </p>
                </div>
                {hasAnyCustomBg && (
                  <button
                    type="button"
                    onClick={() =>
                      updateAppearance('customBackground', { ...DEFAULT_CUSTOM_BACKGROUND })
                    }
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    <Trash2 className="h-3 w-3" />
                    Gỡ nền riêng
                  </button>
                )}
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-zinc-700">
                <input
                  type="checkbox"
                  checked={customBg.sameForBothModes}
                  onChange={(e) => updateCustomBg({ sameForBothModes: e.target.checked })}
                  className="h-4 w-4 rounded accent-blue-600"
                />
                <span>Dùng chung 1 ảnh nền cho cả Tối &amp; Sáng</span>
              </label>

              {customBg.sameForBothModes ? (
                <ImageUploader
                  label="Ảnh nền tùy chỉnh"
                  value={sharedUrl}
                  canSaveLocally={canSaveLocally}
                  onChange={(url) =>
                    updateCustomBg({ darkImageUrl: url, lightImageUrl: url })
                  }
                  onNotify={onNotify}
                />
              ) : (
                <div className="space-y-3">
                  <ImageUploader
                    label="Ảnh nền Chế độ Tối"
                    value={customBg.darkImageUrl}
                    canSaveLocally={canSaveLocally}
                    onChange={(url) => updateCustomBg({ darkImageUrl: url })}
                    onNotify={onNotify}
                  />
                  <ImageUploader
                    label="Ảnh nền Chế độ Sáng"
                    value={customBg.lightImageUrl}
                    canSaveLocally={canSaveLocally}
                    onChange={(url) => updateCustomBg({ lightImageUrl: url })}
                    onNotify={onNotify}
                  />
                </div>
              )}

              {hasAnyCustomBg && (
                <div className="space-y-2.5 border-t border-zinc-200/80 pt-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updateCustomBg({ fullPage: false })}
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                        !customBg.fullPage
                          ? 'border-blue-500 bg-blue-50/70 text-blue-900'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                      }`}
                    >
                      Phủ phần đầu trang
                    </button>
                    <button
                      type="button"
                      onClick={() => updateCustomBg({ fullPage: true })}
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                        customBg.fullPage
                          ? 'border-blue-500 bg-blue-50/70 text-blue-900'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                      }`}
                    >
                      Phủ toàn trang
                    </button>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-zinc-600">Căn khung ảnh</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(
                        [
                          { id: 'top', label: 'Trên' },
                          { id: 'center', label: 'Giữa' },
                          { id: 'bottom', label: 'Dưới' },
                        ] as Array<{ id: BackgroundPosition; label: string }>
                      ).map((pos) => (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => updateCustomBg({ position: pos.id })}
                          className={`rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition ${
                            customBg.position === pos.id
                              ? 'border-blue-500 bg-blue-50/70 text-blue-900'
                              : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                          }`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="space-y-1">
                      <span className="flex items-center justify-between text-[11px] font-semibold text-zinc-600">
                        <span>Độ mờ phông</span>
                        <span className="font-mono">{customBg.blur}px</span>
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={16}
                        step={1}
                        value={customBg.blur}
                        onChange={(e) =>
                          updateCustomBg({ blur: Number.parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-full accent-blue-600"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="flex items-center justify-between text-[11px] font-semibold text-zinc-600">
                        <span>Lớp phủ bảo vệ chữ</span>
                        <span className="font-mono">{customBg.overlayStrength}%</span>
                      </span>
                      <input
                        type="range"
                        min={15}
                        max={90}
                        step={5}
                        value={customBg.overlayStrength}
                        onChange={(e) =>
                          updateCustomBg({
                            overlayStrength: Number.parseInt(e.target.value, 10) || 58,
                          })
                        }
                        className="w-full accent-blue-600"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Light / Dark Mode */}
        <div className="space-y-1.5 pt-1">
          <span className="text-xs font-semibold text-zinc-700">Chế độ Ngày / Đêm</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => updateAppearance('mode', 'light')}
              className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                appearance.mode === 'light'
                  ? 'border-blue-500 bg-blue-50/70 text-blue-900'
                  : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
              Ban ngày
            </button>
            <button
              type="button"
              onClick={() => updateAppearance('mode', 'dark')}
              className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                appearance.mode === 'dark'
                  ? 'border-blue-500 bg-blue-50/70 text-blue-900'
                  : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
              Ban đêm
            </button>
          </div>
        </div>

        {/* Accent Color */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-700">Màu nhấn (Accent)</span>
            <span className="font-mono text-xs text-zinc-500">{appearance.accentColor}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {ACCENT_PRESETS.map((preset) => {
              const selected =
                appearance.accentColor.toLowerCase() === preset.value.toLowerCase();
              return (
                <button
                  key={preset.value}
                  type="button"
                  title={preset.name}
                  onClick={() => updateAppearance('accentColor', preset.value)}
                  className={`h-7 w-7 rounded-full border-2 transition ${
                    selected
                      ? 'scale-110 border-zinc-900 ring-2 ring-zinc-400/40'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: preset.value }}
                  aria-label={`Chọn màu ${preset.name}`}
                />
              );
            })}

            <label
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
              title="Tự chọn màu bất kỳ"
            >
              <Palette className="h-3.5 w-3.5" />
              <span>Tự chọn</span>
              <input
                type="color"
                value={appearance.accentColor}
                onChange={(e) => updateAppearance('accentColor', e.target.value)}
                className="sr-only"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Typography & Shape */}
      <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
        <h3 className="font-heading text-sm font-bold text-zinc-900">
          Font chữ &amp; Bo góc
        </h3>

        <div className="space-y-1.5">
          {(Object.keys(FONT_PRESETS) as FontPreset[]).map((key) => {
            const preset = FONT_PRESETS[key];
            const selected = appearance.fontPreset === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => updateAppearance('fontPreset', key)}
                className={`w-full rounded-xl border p-2.5 text-left transition ${
                  selected
                    ? 'border-blue-500 bg-blue-50/70'
                    : 'border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                <p
                  className="text-sm font-bold text-zinc-900"
                  style={{ fontFamily: preset.heading }}
                >
                  {preset.label}
                </p>
                <p className="text-xs text-zinc-500">{preset.description}</p>
              </button>
            );
          })}
        </div>

        <div className="space-y-1.5 pt-1">
          <span className="text-xs font-semibold text-zinc-700">Độ bo góc</span>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(RADIUS_PRESETS) as BorderRadiusScale[]).map((rKey) => {
              const active = (appearance.borderRadius ?? 'soft') === rKey;
              return (
                <button
                  key={rKey}
                  type="button"
                  onClick={() => updateAppearance('borderRadius', rKey)}
                  className={`rounded-lg border px-2.5 py-2 text-xs font-semibold transition ${
                    active
                      ? 'border-blue-500 bg-blue-50/70 text-blue-900'
                      : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  {RADIUS_PRESETS[rKey].label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hero & Timeline Portfolio Layout */}
      <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
        <h3 className="font-heading text-sm font-bold text-zinc-900">
          Bố cục Trang Giới thiệu &amp; Portfolio
        </h3>

        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-zinc-700">Kiểu Hero đầu trang</span>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'split', label: 'Mở 2 bên' },
                { id: 'centered', label: 'Căn giữa' },
                { id: 'card', label: 'Khung kính' },
              ] as Array<{ id: HeroLayout; label: string }>
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateAppearance('heroLayout', opt.id)}
                className={`rounded-lg border px-2.5 py-2 text-xs font-semibold transition ${
                  (appearance.heroLayout ?? 'split') === opt.id
                    ? 'border-blue-500 bg-blue-50/70 text-blue-900'
                    : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <span className="text-xs font-semibold text-zinc-700">
            Kiểu dòng thời gian Portfolio
          </span>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'timeline', label: 'Timeline dọc' },
                { id: 'timeline-alt', label: 'Xen kẽ 2 bên' },
                { id: 'minimal-grid', label: 'Lưới tối giản' },
              ] as Array<{ id: PortfolioLayout; label: string }>
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateAppearance('portfolioLayout', opt.id)}
                className={`rounded-lg border px-2.5 py-2 text-xs font-semibold transition ${
                  (appearance.portfolioLayout ?? 'timeline') === opt.id
                    ? 'border-blue-500 bg-blue-50/70 text-blue-900'
                    : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Home Section Visibility & Reorder */}
      <div className="space-y-2.5 rounded-xl border border-zinc-200 bg-white p-4">
        <div>
          <h3 className="font-heading text-sm font-bold text-zinc-900">
            Thứ tự &amp; Ẩn/Hiện khối Trang Giới thiệu
          </h3>
          <p className="text-xs text-zinc-500">Điều chỉnh vị trí các khối theo ý bạn.</p>
        </div>

        <div className="space-y-1.5">
          {homeOrder.map((key, idx) => {
            const meta = HOME_SECTION_META[key];
            if (!meta) return null;
            return (
              <div
                key={key}
                className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200/80 px-3 py-2"
              >
                <label className="flex flex-1 cursor-pointer items-center gap-2 text-xs font-medium text-zinc-800">
                  <input
                    type="checkbox"
                    checked={Boolean(appearance.homeSections[meta.toggleKey])}
                    onChange={(e) =>
                      updateAppearance('homeSections', {
                        ...appearance.homeSections,
                        [meta.toggleKey]: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded accent-blue-600"
                  />
                  <span>{meta.label}</span>
                </label>

                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() =>
                      updateAppearance('homeSectionOrder', moveItem(homeOrder, idx, -1))
                    }
                    className="rounded p-1 text-zinc-400 hover:bg-zinc-100 disabled:opacity-30"
                    aria-label={`Đưa ${meta.label} lên`}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === homeOrder.length - 1}
                    onClick={() =>
                      updateAppearance('homeSectionOrder', moveItem(homeOrder, idx, 1))
                    }
                    className="rounded p-1 text-zinc-400 hover:bg-zinc-100 disabled:opacity-30"
                    aria-label={`Đưa ${meta.label} xuống`}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
