import { useCallback, useEffect, useState } from 'react';
import bundledData from '../data/portfolio.json';
import type { PortfolioData, ThemeMode } from '../types/portfolio';
import { createBlankPortfolioData, normalizePortfolioData } from '../utils/normalize';
import { IS_STUDIO_ENABLED } from './useHashRoute';

const DRAFT_STORAGE_KEY = 'portfolio_studio_draft_v5';
const VISITOR_THEME_KEY = 'portfolio_visitor_theme_v2';
const FLASH_STORAGE_KEY = 'portfolio_studio_flash_v1';
const MAX_HISTORY_STEPS = 30;

const initialBundledData = bundledData as unknown as PortfolioData;

function clonePortfolioData(input: PortfolioData): PortfolioData {
  return JSON.parse(JSON.stringify(input)) as PortfolioData;
}

function getNormalizedBundled(): PortfolioData {
  return normalizePortfolioData(initialBundledData, initialBundledData);
}

export function consumeStudioFlashMessage(): string | null {
  if (!IS_STUDIO_ENABLED || typeof window === 'undefined') return null;
  try {
    const msg = window.sessionStorage.getItem(FLASH_STORAGE_KEY);
    if (msg) {
      window.sessionStorage.removeItem(FLASH_STORAGE_KEY);
      return msg;
    }
  } catch {
    // Ignore storage errors
  }
  return null;
}

function isValidPortfolioShape(value: unknown): value is Partial<PortfolioData> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const candidate = value as Partial<PortfolioData>;
  return (
    typeof candidate.profile === 'object' &&
    candidate.profile !== null &&
    typeof candidate.appearance === 'object' &&
    candidate.appearance !== null &&
    Array.isArray(candidate.projects) &&
    Array.isArray(candidate.experiences) &&
    Array.isArray(candidate.achievements) &&
    Array.isArray(candidate.education) &&
    Array.isArray(candidate.skills)
  );
}

function loadInitialStudioState(): {
  data: PortfolioData;
  snapshot: PortfolioData;
  isDirty: boolean;
} {
  const base = getNormalizedBundled();
  if (!IS_STUDIO_ENABLED || typeof window === 'undefined') {
    return { data: base, snapshot: clonePortfolioData(base), isDirty: false };
  }

  try {
    const rawDraft = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!rawDraft) {
      return { data: base, snapshot: clonePortfolioData(base), isDirty: false };
    }
    const parsed = JSON.parse(rawDraft) as unknown;
    if (!isValidPortfolioShape(parsed)) {
      return { data: base, snapshot: clonePortfolioData(base), isDirty: false };
    }
    const normalizedDraft = normalizePortfolioData(parsed, base);
    return {
      data: normalizedDraft,
      snapshot: clonePortfolioData(base),
      isDirty: JSON.stringify(normalizedDraft) !== JSON.stringify(base),
    };
  } catch {
    return { data: base, snapshot: clonePortfolioData(base), isDirty: false };
  }
}

export interface SaveResult {
  ok: boolean;
  destination: 'project' | 'local' | 'error';
  message: string;
}

export function usePortfolioStore(studioUnlocked = false) {
  const [initialState] = useState(loadInitialStudioState);
  const [data, setDataState] = useState<PortfolioData>(initialState.data);
  const [savedSnapshot, setSavedSnapshot] = useState<PortfolioData>(initialState.snapshot);
  const [past, setPast] = useState<PortfolioData[]>([]);
  const [future, setFuture] = useState<PortfolioData[]>([]);
  const [isDirty, setIsDirty] = useState<boolean>(initialState.isDirty);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [canSaveLocally, setCanSaveLocally] = useState<boolean>(false);

  const [visitorThemeOverride, setVisitorThemeOverride] = useState<ThemeMode | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = window.localStorage.getItem(VISITOR_THEME_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // Ignore storage access errors
    }
    return null;
  });

  useEffect(() => {
    if (!IS_STUDIO_ENABLED) return;
    let active = true;

    fetch('/__studio/health')
      .then(async (res) => {
        if (!res.ok) return;
        const json = (await res.json()) as { ok?: boolean };
        if (active && json.ok) {
          setCanSaveLocally(true);
        }
      })
      .catch(() => {
        if (active) setCanSaveLocally(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!IS_STUDIO_ENABLED || !studioUnlocked || !isDirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, studioUnlocked]);

  const persistDraft = useCallback((nextData: PortfolioData, snapshot: PortfolioData) => {
    if (!IS_STUDIO_ENABLED) return;
    const dirty = JSON.stringify(nextData) !== JSON.stringify(snapshot);
    setIsDirty(dirty);
    try {
      if (dirty) {
        window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(nextData));
      } else {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    } catch {
      // Ignore localStorage quota issues
    }
  }, []);

  const commitChange = useCallback(
    (next: PortfolioData) => {
      setPast((prevPast) => [...prevPast.slice(-(MAX_HISTORY_STEPS - 1)), data]);
      setFuture([]);
      setDataState(next);
      persistDraft(next, savedSnapshot);
    },
    [data, persistDraft, savedSnapshot],
  );

  const setData = useCallback(
    (next: PortfolioData) => {
      commitChange(normalizePortfolioData(next, savedSnapshot));
    },
    [commitChange, savedSnapshot],
  );

  const updateData = useCallback(
    (updater: (prev: PortfolioData) => PortfolioData) => {
      const next = updater(data);
      if (next === data) return;
      if (next.appearance.mode !== data.appearance.mode) {
        setVisitorThemeOverride(null);
        try {
          window.localStorage.removeItem(VISITOR_THEME_KEY);
        } catch {
          // Ignore storage errors
        }
      }
      commitChange(next);
    },
    [commitChange, data],
  );

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast((prevPast) => prevPast.slice(0, -1));
    setFuture((prevFuture) => [data, ...prevFuture.slice(0, MAX_HISTORY_STEPS - 1)]);
    setDataState(previous);
    persistDraft(previous, savedSnapshot);
  }, [data, past, persistDraft, savedSnapshot]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const [next, ...rest] = future;
    setFuture(rest);
    setPast((prevPast) => [...prevPast.slice(-(MAX_HISTORY_STEPS - 1)), data]);
    setDataState(next);
    persistDraft(next, savedSnapshot);
  }, [data, future, persistDraft, savedSnapshot]);

  const saveToProject = useCallback(async (): Promise<SaveResult> => {
    if (!IS_STUDIO_ENABLED) {
      return {
        ok: false,
        destination: 'error',
        message: 'Studio không hoạt động ở chế độ công khai.',
      };
    }

    if (!canSaveLocally) {
      try {
        window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
      } catch {
        // Ignore storage error
      }
      return {
        ok: true,
        destination: 'local',
        message:
          'Đang chạy ở trình duyệt (không kết nối dev server): đã lưu bản nháp vào bộ nhớ trình duyệt. Hãy dùng Export JSON để tải file về.',
      };
    }

    setIsSaving(true);
    let previousDraft: string | null = null;
    try {
      previousDraft = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      window.sessionStorage.setItem(
        FLASH_STORAGE_KEY,
        'Đã lưu thẳng vào src/data/portfolio.json trong dự án!',
      );
    } catch {
      // Ignore storage errors
    }

    const restoreDraftAndClearFlash = () => {
      try {
        window.sessionStorage.removeItem(FLASH_STORAGE_KEY);
        if (previousDraft !== null) {
          window.localStorage.setItem(DRAFT_STORAGE_KEY, previousDraft);
        }
      } catch {
        // Ignore storage errors
      }
    };

    try {
      const response = await fetch('/__studio/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        updatedAt?: string;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        restoreDraftAndClearFlash();
        return {
          ok: false,
          destination: 'error',
          message: result.error ?? 'Không thể ghi file src/data/portfolio.json.',
        };
      }

      const committed = {
        ...clonePortfolioData(data),
        updatedAt: result.updatedAt ?? new Date().toISOString(),
      };
      setDataState(committed);
      setSavedSnapshot(committed);
      setIsDirty(false);
      try {
        window.sessionStorage.removeItem(FLASH_STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }

      return {
        ok: true,
        destination: 'project',
        message: 'Đã lưu thẳng vào src/data/portfolio.json trong dự án!',
      };
    } catch {
      restoreDraftAndClearFlash();
      return {
        ok: false,
        destination: 'error',
        message: 'Lỗi kết nối tới dev server khi lưu dữ liệu.',
      };
    } finally {
      setIsSaving(false);
    }
  }, [canSaveLocally, data]);

  const exportJson = useCallback(() => {
    const blob = new Blob([`${JSON.stringify(data, null, 2)}\n`], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'portfolio.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [data]);

  const importJson = useCallback(
    async (file: File): Promise<{ ok: boolean; message: string }> => {
      try {
        const text = await file.text();
        const parsed = JSON.parse(text) as unknown;
        if (!isValidPortfolioShape(parsed)) {
          return {
            ok: false,
            message: 'Tệp JSON không đúng cấu trúc portfolio.json của dự án.',
          };
        }
        const normalized = normalizePortfolioData(parsed, savedSnapshot);
        commitChange(normalized);
        return {
          ok: true,
          message: 'Đã nhập dữ liệu từ tệp JSON. Bấm "Lưu vào dự án" để ghi cố định.',
        };
      } catch {
        return {
          ok: false,
          message: 'Không thể đọc tệp JSON này. Vui lòng kiểm tra lại định dạng.',
        };
      }
    },
    [commitChange, savedSnapshot],
  );

  const resetToSaved = useCallback(() => {
    const restored = clonePortfolioData(savedSnapshot);
    commitChange(restored);
  }, [commitChange, savedSnapshot]);

  const loadBlankProfile = useCallback(() => {
    commitChange(createBlankPortfolioData(data.studioAccess));
  }, [commitChange, data.studioAccess]);

  const restoreSampleData = useCallback(() => {
    const sample = getNormalizedBundled();
    commitChange({
      ...sample,
      studioAccess: data.studioAccess ?? sample.studioAccess,
    });
  }, [commitChange, data.studioAccess]);

  const effectiveMode: ThemeMode = visitorThemeOverride ?? data.appearance.mode;

  const toggleVisitorTheme = useCallback(() => {
    setVisitorThemeOverride((prev) => {
      const current = prev ?? data.appearance.mode;
      const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
      try {
        window.localStorage.setItem(VISITOR_THEME_KEY, next);
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, [data.appearance.mode]);

  return {
    data,
    effectiveMode,
    isDirty,
    isSaving,
    canSaveLocally,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    undo,
    redo,
    setData,
    updateData,
    saveToProject,
    exportJson,
    importJson,
    resetToSaved,
    loadBlankProfile,
    restoreSampleData,
    toggleVisitorTheme,
  };
}
