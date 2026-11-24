import { Suspense, lazy, useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, KeyRound, Lock } from 'lucide-react';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { Toast, type ToastMessage } from './components/Toast';
import { IS_STUDIO_ENABLED, useHashRoute } from './hooks/useHashRoute';
import { consumeStudioFlashMessage, usePortfolioStore } from './hooks/usePortfolioStore';
import { CvPage } from './pages/CvPage';
import { HomePage } from './pages/HomePage';
import {
  IS_FIREBASE_CONFIGURED,
  signInStudioWithFirebase,
  signOutStudioFirebase,
  subscribeFirebaseStudioAuth,
} from './utils/firebaseService';
import {
  isStudioSessionUnlocked,
  setStudioSessionUnlocked,
  verifyStudioPassword,
} from './utils/studioAuth';
import { getSkyBackdropAsset, getThemeStyle } from './utils/theme';

const LazyStudioPage = lazy(() => import('./studio/StudioPage'));

export function App() {
  const { route, navigate } = useHashRoute();
  const [studioUnlocked, setStudioUnlocked] = useState<boolean>(
    () => IS_STUDIO_ENABLED && isStudioSessionUnlocked(),
  );

  const {
    data,
    effectiveMode,
    isDirty,
    isSaving,
    assetRevision,
    isFirebaseEnabled,
    canSaveLocally,
    canPublishToGitHub,
    githubConfig,
    canUndo,
    canRedo,
    undo,
    redo,
    updateData,
    updateGitHubConfig,
    disconnectGitHub,
    saveToProject,
    exportJson,
    importJson,
    loadBlankProfile,
    restoreSampleData,
    toggleVisitorTheme,
  } = usePortfolioStore(studioUnlocked);

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const notify = useCallback(
    (
      type: ToastMessage['type'],
      text: string,
      action?: { label: string; onClick: () => void },
    ) => {
      setToast({
        id: Date.now(),
        type,
        text,
        actionLabel: action?.label,
        onAction: action?.onClick,
      });
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
      toastTimerRef.current = window.setTimeout(() => {
        setToast(null);
      }, action ? 5200 : 3600);
    },
    [],
  );

  useEffect(() => {
    if (!IS_FIREBASE_CONFIGURED) return;
    return subscribeFirebaseStudioAuth((signedIn) => {
      setStudioUnlocked(signedIn);
      setStudioSessionUnlocked(signedIn);
    });
  }, []);

  const handleUnlockStudio = useCallback(
    async (password: string): Promise<boolean> => {
      if (!IS_STUDIO_ENABLED) return false;
      if (IS_FIREBASE_CONFIGURED) {
        const res = await signInStudioWithFirebase(password);
        if (!res.ok) {
          if (res.message && !res.message.includes('chưa đúng')) {
            notify('error', res.message);
          }
          return false;
        }
        setStudioSessionUnlocked(true);
        setStudioUnlocked(true);
        navigate('studio');
        notify('success', 'Đã mở khóa Studio (Firebase)');
        return true;
      }

      const ok = await verifyStudioPassword(password, data.studioAccess?.passwordHash);
      if (!ok) return false;
      setStudioSessionUnlocked(true);
      setStudioUnlocked(true);
      navigate('studio');
      notify('success', 'Đã mở khóa Studio');
      return true;
    },
    [data.studioAccess?.passwordHash, navigate, notify],
  );

  const handleLockStudio = useCallback(() => {
    if (IS_FIREBASE_CONFIGURED) {
      void signOutStudioFirebase();
    }
    setStudioSessionUnlocked(false);
    setStudioUnlocked(false);
    navigate('home');
    notify('info', 'Đã khóa phiên Studio');
  }, [navigate, notify]);

  useEffect(() => {
    const flash = consumeStudioFlashMessage();
    if (flash) {
      notify('success', flash);
    }
  }, [notify]);

  useEffect(() => {
    document.title = `${data.profile.fullName} — ${data.profile.role}`;
  }, [data.profile.fullName, data.profile.role]);

  useEffect(() => {
    const root = document.documentElement;
    const isStudioRoute = IS_STUDIO_ENABLED && route === 'studio' && studioUnlocked;
    if (!isStudioRoute && effectiveMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.style.colorScheme = isStudioRoute ? 'light' : effectiveMode;

    const themeVars = getThemeStyle(data.appearance, effectiveMode) as Record<string, string>;
    Object.entries(themeVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [effectiveMode, data.appearance, route, studioUnlocked]);

  if (IS_STUDIO_ENABLED && route === 'studio') {
    if (!studioUnlocked) {
      return (
        <>
          <StudioLockScreen
            profileName={data.profile.fullName}
            onUnlock={handleUnlockStudio}
            onBack={() => navigate('home')}
          />
          <Toast toast={toast} onClose={() => setToast(null)} />
        </>
      );
    }

    return (
      <>
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-sm text-zinc-600">
              Đang tải Studio...
            </div>
          }
        >
          <LazyStudioPage
            data={data}
            isDirty={isDirty}
            isSaving={isSaving}
            assetRevision={assetRevision}
            isFirebaseEnabled={isFirebaseEnabled}
            canSaveLocally={canSaveLocally}
            canPublishToGitHub={canPublishToGitHub}
            githubConfig={githubConfig}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
            onUpdateData={updateData}
            onUpdateGitHubConfig={updateGitHubConfig}
            onDisconnectGitHub={disconnectGitHub}
            onSaveToProject={saveToProject}
            onExportJson={exportJson}
            onImportJson={importJson}
            onLoadBlankProfile={loadBlankProfile}
            onRestoreSampleData={restoreSampleData}
            onLockStudio={handleLockStudio}
            onNavigate={navigate}
            onNotify={notify}
          />
        </Suspense>
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  const skyAsset = getSkyBackdropAsset(data.appearance, effectiveMode);
  const overDarkSky = Boolean(skyAsset?.isDarkHero);

  return (
    <div
      data-asset-rev={assetRevision}
      className="font-body sky-page-canvas flex min-h-screen flex-col transition-colors"
    >
      <Navbar
        profile={data.profile}
        route={route}
        mode={effectiveMode}
        overDarkSky={overDarkSky}
        onNavigate={navigate}
        onToggleTheme={toggleVisitorTheme}
      />

      <main className="flex-1">
        {route === 'home' && (
          <HomePage
            data={data}
            activeMode={effectiveMode}
            onNavigate={navigate}
            onNotify={notify}
          />
        )}
        {route === 'cv' && <CvPage data={data} activeMode={effectiveMode} />}
      </main>

      <Footer
        profile={data.profile}
        onNavigate={navigate}
        studioEnabled={IS_STUDIO_ENABLED}
        studioUnlocked={studioUnlocked}
        onUnlockStudio={handleUnlockStudio}
        onOpenStudio={() => navigate('studio')}
        onLockStudio={handleLockStudio}
      />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

function StudioLockScreen({
  profileName,
  onUnlock,
  onBack,
}: {
  profileName: string;
  onUnlock: (password: string) => Promise<boolean>;
  onBack: () => void;
}) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (checking) return;
    if (!password.trim()) {
      setError('Vui lòng nhập mật khẩu Studio');
      return;
    }
    setChecking(true);
    setError('');
    try {
      const ok = await onUnlock(password);
      if (!ok) {
        setError('Mật khẩu chưa đúng. Vui lòng thử lại.');
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="font-body sky-page-canvas flex min-h-screen items-center justify-center p-4">
      <div className="surface-glass radius-card w-full max-w-sm space-y-5 border border-token p-6 shadow-xl">
        <div className="space-y-2 text-center">
          <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-token bg-[var(--accent-soft)] text-accent-safe">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="font-heading text-lg font-bold ink-primary">
            Mở khóa Studio
          </h1>
          <p className="text-xs leading-relaxed ink-muted">
            Khu vực chỉnh sửa hồ sơ &amp; giao diện của{' '}
            <span className="font-medium ink-secondary">{profileName}</span> được bảo vệ bằng mật
            khẩu.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <KeyRound className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 ink-muted opacity-70" />
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              placeholder="Nhập mật khẩu Studio..."
              aria-label="Mật khẩu Studio"
              autoComplete="current-password"
              className="w-full rounded-xl border border-token bg-[var(--bg-surface)] py-2.5 pr-3 pl-9 text-sm ink-primary outline-none transition focus:border-[var(--accent)]"
            />
          </div>

          {error && (
            <p role="alert" className="text-xs font-medium text-rose-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={checking}
            className="radius-btn sky-btn-primary w-full py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {checking ? 'Đang xác thực...' : 'Vào Studio'}
          </button>
        </form>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex w-full items-center justify-center gap-1.5 text-xs font-medium ink-muted transition hover:ink-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Quay lại trang công khai</span>
        </button>
      </div>
    </div>
  );
}

export default App;
