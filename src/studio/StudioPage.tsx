import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Award,
  Briefcase,
  Database,
  Eye,
  FileSpreadsheet,
  FolderKanban,
  GraduationCap,
  Laptop,
  Loader2,
  Lock,
  MousePointerClick,
  Palette,
  Redo2,
  Save,
  Smartphone,
  Sticker,
  Tablet,
  Undo2,
  User,
} from 'lucide-react';
import { CvPage } from '../pages/CvPage';
import { HomePage } from '../pages/HomePage';
import type {
  CanvasSticker,
  EditFocusTarget,
  PortfolioData,
  RouteView,
  StudioSectionId,
} from '../types/portfolio';
import { createId } from '../utils/assets';
import type { GitHubSyncConfig } from '../utils/githubPublish';
import { getThemeStyle } from '../utils/theme';
import { AppearanceEditor } from './AppearanceEditor';
import { ContentEditor, type ContentEditorSection } from './ContentEditor';
import { DataManagerPanel } from './DataManagerPanel';
import { StickerEditor } from './StickerEditor';

interface StudioPageProps {
  data: PortfolioData;
  isDirty: boolean;
  isSaving: boolean;
  canSaveLocally: boolean;
  canPublishToGitHub: boolean;
  githubConfig: GitHubSyncConfig;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onUpdateData: (updater: (prev: PortfolioData) => PortfolioData) => void;
  onUpdateGitHubConfig: (next: GitHubSyncConfig) => void;
  onDisconnectGitHub: () => void;
  onSaveToProject: () => Promise<{ ok: boolean; message: string }>;
  onExportJson: () => void;
  onImportJson: (file: File) => Promise<{ ok: boolean; message: string }>;
  onLoadBlankProfile: () => void;
  onRestoreSampleData: () => void;
  onLockStudio?: () => void;
  onNavigate: (route: RouteView) => void;
  onNotify: (
    type: 'success' | 'error' | 'info',
    text: string,
    action?: { label: string; onClick: () => void },
  ) => void;
}

type PreviewRoute = 'home' | 'cv';
type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const SECTION_STORAGE_KEY = 'portfolio_studio_section_v2';
const PREVIEW_ROUTE_STORAGE_KEY = 'portfolio_studio_preview_v2';

const RAIL_ITEMS: Array<{
  id: StudioSectionId;
  label: string;
  icon: typeof User;
}> = [
  { id: 'profile', label: 'Hồ sơ', icon: User },
  { id: 'experiences', label: 'Công việc', icon: Briefcase },
  { id: 'projects', label: 'Dự án', icon: FolderKanban },
  { id: 'achievements', label: 'Thành tích', icon: Award },
  { id: 'eduSkills', label: 'Học vấn', icon: GraduationCap },
  { id: 'appearance', label: 'Giao diện', icon: Palette },
  { id: 'stickers', label: 'Trang trí', icon: Sticker },
  { id: 'cv', label: 'CV (A4)', icon: FileSpreadsheet },
  { id: 'data', label: 'Dữ liệu', icon: Database },
];

const VIEWPORT_CYCLE: ViewportSize[] = ['desktop', 'tablet', 'mobile'];
const VIEWPORT_LABEL: Record<ViewportSize, string> = {
  desktop: 'Máy tính (rộng)',
  tablet: 'Tablet (768px)',
  mobile: 'Điện thoại (390px)',
};

export default function StudioPage({
  data,
  isDirty,
  isSaving,
  canSaveLocally,
  canPublishToGitHub,
  githubConfig,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onUpdateData,
  onUpdateGitHubConfig,
  onDisconnectGitHub,
  onSaveToProject,
  onExportJson,
  onImportJson,
  onLoadBlankProfile,
  onRestoreSampleData,
  onLockStudio,
  onNavigate,
  onNotify,
}: StudioPageProps) {
  const [activeSection, setActiveSection] = useState<StudioSectionId>(() => {
    try {
      const saved = window.sessionStorage.getItem(SECTION_STORAGE_KEY) as StudioSectionId | null;
      if (saved && RAIL_ITEMS.some((i) => i.id === saved)) return saved;
    } catch {
      // Ignore storage errors
    }
    return 'profile';
  });

  const [previewRoute, setPreviewRoute] = useState<PreviewRoute>(() => {
    try {
      const saved = window.sessionStorage.getItem(PREVIEW_ROUTE_STORAGE_KEY);
      if (saved === 'cv') return 'cv';
    } catch {
      // Ignore storage errors
    }
    return 'home';
  });

  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [clickToEdit, setClickToEdit] = useState(true);
  const [focusTarget, setFocusTarget] = useState<EditFocusTarget | null>(null);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [mobileShowPreview, setMobileShowPreview] = useState(false);

  const handleSelectPreviewRoute = useCallback((next: PreviewRoute) => {
    setPreviewRoute(next);
    try {
      window.sessionStorage.setItem(PREVIEW_ROUTE_STORAGE_KEY, next);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleSelectSection = useCallback(
    (next: StudioSectionId) => {
      setActiveSection(next);
      if (next === 'stickers') {
        handleSelectPreviewRoute('home');
      }
      try {
        window.sessionStorage.setItem(SECTION_STORAGE_KEY, next);
      } catch {
        // Ignore storage errors
      }
    },
    [handleSelectPreviewRoute],
  );

  const handleSelectStickerFromPreview = useCallback(
    (id: string | null) => {
      setSelectedStickerId(id);
      if (id) {
        handleSelectSection('stickers');
      }
    },
    [handleSelectSection],
  );

  const handleUpdateSticker = useCallback(
    (id: string, patch: Partial<CanvasSticker>) => {
      onUpdateData((prev) => ({
        ...prev,
        appearance: {
          ...prev.appearance,
          stickers: (prev.appearance.stickers ?? []).map((s) =>
            s.id === id ? { ...s, ...patch } : s,
          ),
        },
      }));
    },
    [onUpdateData],
  );

  const handleDeleteSticker = useCallback(
    (id: string) => {
      onUpdateData((prev) => ({
        ...prev,
        appearance: {
          ...prev.appearance,
          stickers: (prev.appearance.stickers ?? []).filter((s) => s.id !== id),
        },
      }));
      setSelectedStickerId((curr) => (curr === id ? null : curr));
    },
    [onUpdateData],
  );

  const handleDuplicateSticker = useCallback(
    (id: string) => {
      const currentList = data.appearance.stickers ?? [];
      const src = currentList.find((s) => s.id === id);
      if (!src) return;
      const copy: CanvasSticker = {
        ...src,
        id: createId('stk'),
        x: Math.min(96, src.x + 4),
        y: Math.min(97, src.y + 3),
      };
      onUpdateData((prev) => ({
        ...prev,
        appearance: {
          ...prev.appearance,
          stickers: [...(prev.appearance.stickers ?? []), copy],
        },
      }));
      setSelectedStickerId(copy.id);
    },
    [data.appearance.stickers, onUpdateData],
  );

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    const res = await onSaveToProject();
    onNotify(res.ok ? 'success' : 'error', res.message);
  }, [isSaving, onNotify, onSaveToProject]);

  const handleEditTarget = useCallback(
    (target: EditFocusTarget) => {
      handleSelectSection(target.section);
      setFocusTarget(target);
      setMobileShowPreview(false);
    },
    [handleSelectSection],
  );

  const cycleViewport = () => {
    const idx = VIEWPORT_CYCLE.indexOf(viewport);
    setViewport(VIEWPORT_CYCLE[(idx + 1) % VIEWPORT_CYCLE.length]);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.ctrlKey || event.metaKey;
      if (!mod) return;

      const key = event.key.toLowerCase();
      if (key === 's') {
        event.preventDefault();
        void handleSave();
        return;
      }

      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isTyping = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';
      if (isTyping) return;

      if (key === 'z' && !event.shiftKey) {
        event.preventDefault();
        onUndo();
      } else if ((key === 'z' && event.shiftKey) || key === 'y') {
        event.preventDefault();
        onRedo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSave, onRedo, onUndo]);

  const getBadgeCount = (id: StudioSectionId): number | null => {
    switch (id) {
      case 'experiences':
        return data.experiences.length;
      case 'projects':
        return data.projects.length;
      case 'achievements':
        return data.achievements.length;
      case 'eduSkills':
        return data.education.length + data.skills.length;
      case 'stickers':
        return (data.appearance.stickers ?? []).length;
      default:
        return null;
    }
  };

  const previewThemeStyle = getThemeStyle(data.appearance, data.appearance.mode);
  const previewIsDark = data.appearance.mode === 'dark';

  const isContentSection =
    activeSection === 'profile' ||
    activeSection === 'experiences' ||
    activeSection === 'projects' ||
    activeSection === 'achievements' ||
    activeSection === 'eduSkills';

  const ViewportIcon =
    viewport === 'mobile' ? Smartphone : viewport === 'tablet' ? Tablet : Laptop;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-100 text-zinc-900 print:block print:h-auto print:overflow-visible print:bg-white">
      {/* Calm Decluttered Studio Header */}
      <header className="no-print flex items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            title="Quay về trang công khai"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-heading text-sm font-bold text-zinc-900">Studio</span>
            <span
              className={`h-2 w-2 rounded-full ${
                canSaveLocally || canPublishToGitHub ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              title={
                canSaveLocally
                  ? 'Kết nối dự án cục bộ: Lưu thẳng vào portfolio.json'
                  : canPublishToGitHub
                    ? `Đã kết nối GitHub (${githubConfig.owner}/${githubConfig.repo}): bấm Đăng lên Web để cập nhật ngay`
                    : 'Chế độ trình duyệt: Lưu nháp cục bộ (vào Dữ liệu để bật Đăng lên Web 1 chạm)'
              }
            />
          </div>
        </div>

        {/* Center 2-Tab Preview Switcher */}
        <div className="hidden items-center gap-1 rounded-full bg-zinc-100 p-1 md:flex">
          {(
            [
              { id: 'home', label: 'Trang chính' },
              { id: 'cv', label: 'CV (A4)' },
            ] as Array<{ id: PreviewRoute; label: string }>
          ).map((item) => {
            const active = previewRoute === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectPreviewRoute(item.id)}
                className={`rounded-full px-4 py-1 text-xs font-medium transition ${
                  active ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right Minimal Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setClickToEdit((prev) => !prev)}
            title={
              clickToEdit
                ? 'Đang bật: Chạm vào phần xem trước để sửa nhanh'
                : 'Bật chế độ chạm để sửa'
            }
            className={`hidden h-8 w-8 items-center justify-center rounded-lg transition md:inline-flex ${
              clickToEdit
                ? 'bg-blue-50 text-blue-600'
                : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            <MousePointerClick className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={cycleViewport}
            title={`Khung xem: ${VIEWPORT_LABEL[viewport]} (nhấn để đổi)`}
            className="hidden h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 xl:inline-flex"
          >
            <ViewportIcon className="h-4 w-4" />
          </button>

          <button
            type="button"
            disabled={!canUndo}
            onClick={onUndo}
            title="Hoàn tác (Ctrl+Z)"
            aria-label="Hoàn tác"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-30"
          >
            <Undo2 className="h-4 w-4" />
          </button>

          <button
            type="button"
            disabled={!canRedo}
            onClick={onRedo}
            title="Làm lại (Ctrl+Shift+Z)"
            aria-label="Làm lại"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-30"
          >
            <Redo2 className="h-4 w-4" />
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            title={
              canSaveLocally
                ? 'Lưu thay đổi vào dự án (Ctrl+S)'
                : canPublishToGitHub
                  ? 'Lưu và xuất bản thẳng lên GitHub Pages (Ctrl+S)'
                  : 'Lưu bản nháp trình duyệt (Ctrl+S)'
            }
            className={`relative ml-1.5 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-white transition disabled:opacity-60 ${
              !canSaveLocally && canPublishToGitHub
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-zinc-900 hover:bg-zinc-800'
            }`}
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>
              {canSaveLocally ? 'Lưu' : canPublishToGitHub ? 'Đăng lên Web' : 'Lưu nháp'}
            </span>
            {isDirty && (
              <span
                className="h-1.5 w-1.5 rounded-full bg-amber-400"
                title="Có thay đổi chưa lưu"
              />
            )}
          </button>

          {onLockStudio && (
            <button
              type="button"
              onClick={onLockStudio}
              title="Khóa phiên Studio & quay về trang công khai"
              aria-label="Khóa phiên Studio"
              className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
            >
              <Lock className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {/* 3-Zone Workspace Body */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Zone 1: Left Navigation Rail */}
        <nav
          aria-label="Danh mục Studio"
          className={`no-print flex w-16 shrink-0 flex-col gap-1 overflow-y-auto border-r border-zinc-200 bg-white p-2 xl:w-48 print:hidden ${
            mobileShowPreview ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {RAIL_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            const count = getBadgeCount(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectSection(item.id)}
                title={item.label}
                className={`flex items-center justify-center gap-2.5 rounded-xl px-2.5 py-2.5 text-xs font-semibold transition xl:justify-between xl:px-3 ${
                  active
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden xl:inline">{item.label}</span>
                </span>
                {count !== null && (
                  <span className="hidden font-mono text-[11px] opacity-70 xl:inline">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 2: Center Inspector */}
        <aside
          className={`no-print flex h-full flex-1 flex-col border-r border-zinc-200 bg-zinc-50 lg:w-[400px] lg:flex-none xl:w-[430px] ${
            mobileShowPreview ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="border-b border-zinc-200 bg-white px-4 py-3">
            <h2 className="font-heading text-sm font-bold text-zinc-900">
              {RAIL_ITEMS.find((i) => i.id === activeSection)?.label}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {isContentSection && (
              <ContentEditor
                activeSection={activeSection as ContentEditorSection}
                data={data}
                canSaveLocally={canSaveLocally}
                focusTarget={focusTarget}
                onChange={onUpdateData}
                onUndo={onUndo}
                onNotify={onNotify}
              />
            )}

            {activeSection === 'appearance' && (
              <AppearanceEditor
                mode="site"
                data={data}
                canSaveLocally={canSaveLocally}
                onChange={onUpdateData}
                onNotify={onNotify}
              />
            )}

            {activeSection === 'stickers' && (
              <StickerEditor
                data={data}
                canSaveLocally={canSaveLocally}
                selectedStickerId={selectedStickerId}
                onSelectSticker={setSelectedStickerId}
                onChange={onUpdateData}
                onNotify={onNotify}
              />
            )}

            {activeSection === 'cv' && (
              <AppearanceEditor mode="cv" data={data} onChange={onUpdateData} />
            )}

            {activeSection === 'data' && (
              <DataManagerPanel
                data={data}
                canSaveLocally={canSaveLocally}
                canPublishToGitHub={canPublishToGitHub}
                githubConfig={githubConfig}
                onUpdateData={onUpdateData}
                onUpdateGitHubConfig={onUpdateGitHubConfig}
                onDisconnectGitHub={onDisconnectGitHub}
                onExportJson={onExportJson}
                onImportJson={onImportJson}
                onLoadBlankProfile={onLoadBlankProfile}
                onRestoreSampleData={onRestoreSampleData}
                onLockStudio={onLockStudio}
                onJumpSection={handleSelectSection}
                onNotify={onNotify}
              />
            )}
          </div>
        </aside>

        {/* Zone 3: Browser-Framed Live Preview */}
        <main
          className={`flex-1 overflow-y-auto bg-zinc-200/75 p-3 sm:p-5 print:block print:overflow-visible print:bg-white print:p-0 ${
            mobileShowPreview ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="no-print mb-3 flex items-center justify-between gap-2 lg:hidden">
            <div className="flex items-center gap-1 rounded-full bg-white p-1 shadow-sm">
              {(['home', 'cv'] as PreviewRoute[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleSelectPreviewRoute(tab)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    previewRoute === tab ? 'bg-zinc-900 text-white' : 'text-zinc-600'
                  }`}
                >
                  {tab === 'home' ? 'Trang chính' : 'CV'}
                </button>
              ))}
            </div>
          </div>

          <div
            className={`mx-auto min-h-full overflow-hidden rounded-2xl border border-zinc-300/90 shadow-xl transition-all print:max-w-none print:overflow-visible print:rounded-none print:border-0 print:shadow-none ${
              viewport === 'mobile'
                ? 'max-w-[390px]'
                : viewport === 'tablet'
                  ? 'max-w-[768px]'
                  : 'w-full'
            }`}
          >
            {/* Slim Browser Chrome */}
            <div className="no-print flex items-center justify-between border-b border-zinc-200 bg-zinc-100 px-3.5 py-2 text-[11px] text-zinc-500">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="font-mono text-[10px] text-zinc-500">
                {(typeof window !== 'undefined' && window.location.host
                  ? window.location.host
                  : 'localhost:5173')}
                /#/{previewRoute}
              </span>
              <span className="hidden text-[10px] sm:inline">
                {clickToEdit ? 'Chạm để sửa' : 'Xem trước'}
              </span>
            </div>

            <div style={previewThemeStyle} className={`min-h-full ${previewIsDark ? 'dark' : ''}`}>
              <div className="font-body sky-page-canvas min-h-full transition-colors print:bg-white print:text-zinc-900">
                {previewRoute === 'home' && (
                  <HomePage
                    data={data}
                    activeMode={data.appearance.mode}
                    insideStudio
                    clickToEdit={clickToEdit}
                    onEditTarget={handleEditTarget}
                    selectedStickerId={selectedStickerId}
                    onSelectSticker={handleSelectStickerFromPreview}
                    onUpdateSticker={handleUpdateSticker}
                    onDeleteSticker={handleDeleteSticker}
                    onDuplicateSticker={handleDuplicateSticker}
                    onNavigate={(next) => {
                      if (next === 'home' || next === 'cv') {
                        handleSelectPreviewRoute(next);
                      }
                    }}
                    onNotify={onNotify}
                  />
                )}
                {previewRoute === 'cv' && (
                  <CvPage
                    data={data}
                    activeMode={data.appearance.mode}
                    insideStudio
                    clickToEdit={clickToEdit}
                    onEditTarget={handleEditTarget}
                  />
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Mobile Floating Toggle */}
        <button
          type="button"
          onClick={() => setMobileShowPreview((prev) => !prev)}
          className="no-print fixed bottom-4 left-4 z-40 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white shadow-lg lg:hidden"
        >
          <Eye className="h-4 w-4" />
          <span>{mobileShowPreview ? 'Chỉnh sửa' : 'Xem trước'}</span>
        </button>
      </div>
    </div>
  );
}
