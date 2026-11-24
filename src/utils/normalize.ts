import type {
  BackgroundPosition,
  CanvasSticker,
  CustomBackgroundConfig,
  CvSectionKey,
  HomeSectionKey,
  PortfolioData,
  PortfolioLayout,
  ProjectItem,
  SkyBackdrop,
  StickerAnimation,
  StickerKind,
  StickerLayer,
  StudioAccessConfig,
  StudioSectionId,
  StylePreset,
} from '../types/portfolio';
import { DEFAULT_STUDIO_PASSWORD_HASH } from './studioAuth';

export const DEFAULT_CUSTOM_BACKGROUND: CustomBackgroundConfig = {
  sameForBothModes: true,
  darkImageUrl: '',
  lightImageUrl: '',
  blur: 0,
  overlayStrength: 58,
  position: 'center',
  fullPage: false,
};

function clampNum(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function normalizeBackgroundPosition(value: unknown): BackgroundPosition {
  if (value === 'top' || value === 'bottom') return value;
  return 'center';
}

function normalizeCustomBackground(raw: unknown): CustomBackgroundConfig {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { ...DEFAULT_CUSTOM_BACKGROUND };
  }
  const input = raw as Partial<CustomBackgroundConfig>;
  return {
    sameForBothModes:
      typeof input.sameForBothModes === 'boolean' ? input.sameForBothModes : true,
    darkImageUrl: typeof input.darkImageUrl === 'string' ? input.darkImageUrl.trim() : '',
    lightImageUrl: typeof input.lightImageUrl === 'string' ? input.lightImageUrl.trim() : '',
    blur: Math.round(clampNum(input.blur, 0, 16, 0)),
    overlayStrength: Math.round(clampNum(input.overlayStrength, 15, 90, 58)),
    position: normalizeBackgroundPosition(input.position),
    fullPage: Boolean(input.fullPage),
  };
}

function normalizeStickerKind(value: unknown): StickerKind {
  if (value === 'image' || value === 'badge' || value === 'emoji') return value;
  return 'builtin';
}

function normalizeStickerAnimation(value: unknown): StickerAnimation {
  if (value === 'float' || value === 'pulse' || value === 'wiggle' || value === 'spin-slow') {
    return value;
  }
  return 'none';
}

function normalizeStickerLayer(value: unknown): StickerLayer {
  return value === 'behind' ? 'behind' : 'front';
}

function normalizeStickers(raw: unknown): CanvasSticker[] {
  if (!Array.isArray(raw)) return [];
  const result: CanvasSticker[] = [];
  raw.forEach((item, idx) => {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) return;
    const cand = item as Partial<CanvasSticker>;
    if (typeof cand.content !== 'string' || !cand.content.trim()) return;
    result.push({
      id: typeof cand.id === 'string' && cand.id.trim() ? cand.id : `stk-${idx + 1}`,
      kind: normalizeStickerKind(cand.kind),
      content: cand.content,
      label: typeof cand.label === 'string' ? cand.label : undefined,
      bgColor: typeof cand.bgColor === 'string' ? cand.bgColor : undefined,
      textColor: typeof cand.textColor === 'string' ? cand.textColor : undefined,
      x: Math.round(clampNum(cand.x, 2, 98, 50) * 10) / 10,
      y: Math.round(clampNum(cand.y, 1, 99, 20) * 10) / 10,
      size: Math.round(clampNum(cand.size, 32, 240, 72)),
      rotation: Math.round(clampNum(cand.rotation, -180, 180, 0)),
      opacity: Math.round(clampNum(cand.opacity, 0.15, 1, 1) * 100) / 100,
      layer: normalizeStickerLayer(cand.layer),
      animation: normalizeStickerAnimation(cand.animation),
      hideOnMobile: Boolean(cand.hideOnMobile),
    });
  });
  return result;
}

export const DEFAULT_HOME_SECTION_ORDER: HomeSectionKey[] = [
  'highlights',
  'story',
  'timeline',
  'skills',
  'contact',
];

export const DEFAULT_CV_SECTION_ORDER: CvSectionKey[] = [
  'summary',
  'experience',
  'projects',
  'skills',
  'education',
  'achievements',
];

function normalizeStylePreset(value: unknown): StylePreset {
  if (value === 'sky' || value === 'sky-pastel' || value === 'editorial' || value === 'minimal') {
    return value;
  }
  if (value === 'nordic') return 'sky-pastel';
  if (value === 'obsidian') return 'sky';
  return 'sky';
}

function normalizeSkyBackdrop(value: unknown, preset: StylePreset): SkyBackdrop {
  if (value === 'cumulus' || value === 'pastel' || value === 'horizon' || value === 'none') {
    return value;
  }
  if (preset === 'sky-pastel') return 'pastel';
  if (preset === 'editorial' || preset === 'minimal') return 'none';
  return 'cumulus';
}

function normalizePortfolioLayout(value: unknown): PortfolioLayout {
  if (value === 'timeline' || value === 'timeline-alt' || value === 'minimal-grid') {
    return value;
  }
  return 'timeline';
}

function mergeSectionOrder<T extends string>(input: unknown, defaults: readonly T[]): T[] {
  if (!Array.isArray(input)) return [...defaults];
  const validSet = new Set<T>(defaults);
  const seen = new Set<T>();
  const result: T[] = [];

  for (const item of input) {
    if (typeof item === 'string' && validSet.has(item as T) && !seen.has(item as T)) {
      seen.add(item as T);
      result.push(item as T);
    }
  }
  for (const fallbackKey of defaults) {
    if (!seen.has(fallbackKey)) {
      result.push(fallbackKey);
    }
  }
  return result;
}

export function normalizePortfolioData(raw: unknown, fallback: PortfolioData): PortfolioData {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return JSON.parse(JSON.stringify(fallback)) as PortfolioData;
  }

  const input = raw as Partial<PortfolioData>;
  const rawAppearance = (input.appearance ?? {}) as Partial<PortfolioData['appearance']> & {
    stylePreset?: unknown;
    portfolioLayout?: unknown;
    skyBackdrop?: unknown;
  };
  const rawCv = (rawAppearance.cvSettings ?? {}) as Partial<
    PortfolioData['appearance']['cvSettings']
  >;
  const rawHomeSections = (rawAppearance.homeSections ?? {}) as Partial<
    PortfolioData['appearance']['homeSections']
  >;

  const stylePreset = normalizeStylePreset(
    rawAppearance.stylePreset ?? fallback.appearance.stylePreset,
  );
  const skyBackdrop = normalizeSkyBackdrop(rawAppearance.skyBackdrop, stylePreset);
  const portfolioLayout = normalizePortfolioLayout(
    rawAppearance.portfolioLayout ?? fallback.appearance.portfolioLayout,
  );

  const projects: ProjectItem[] = Array.isArray(input.projects)
    ? input.projects.map((proj) => ({
        ...proj,
        category: typeof proj.category === 'string' ? proj.category : 'Dự án',
        galleryUrls: Array.isArray(proj.galleryUrls) ? proj.galleryUrls : [],
        tags: Array.isArray(proj.tags) ? proj.tags : [],
        caseStudy: {
          problem: proj.caseStudy?.problem ?? '',
          solution: proj.caseStudy?.solution ?? '',
          impact: proj.caseStudy?.impact ?? '',
        },
      }))
    : fallback.projects;

  const experiences = Array.isArray(input.experiences)
    ? input.experiences.map((exp) => ({
        ...exp,
        bullets: Array.isArray(exp.bullets) ? exp.bullets : [],
        tags: Array.isArray(exp.tags) ? exp.tags : [],
      }))
    : fallback.experiences;

  const achievements = Array.isArray(input.achievements)
    ? input.achievements.map((ach) => ({
        ...ach,
        tags: Array.isArray(ach.tags) ? ach.tags : [],
      }))
    : fallback.achievements;

  const skills = Array.isArray(input.skills)
    ? input.skills.map((group) => ({
        ...group,
        skills: Array.isArray(group.skills) ? group.skills : [],
      }))
    : fallback.skills;

  const education = Array.isArray(input.education) ? input.education : fallback.education;

  const rawStudioHash = input.studioAccess?.passwordHash;
  const fallbackStudioHash = fallback.studioAccess?.passwordHash ?? DEFAULT_STUDIO_PASSWORD_HASH;
  const normalizedStudioAccess: StudioAccessConfig = {
    passwordHash:
      typeof rawStudioHash === 'string' && /^[a-f0-9]{64}$/i.test(rawStudioHash.trim())
        ? rawStudioHash.trim().toLowerCase()
        : fallbackStudioHash,
  };

  const normalizedCustomBg = normalizeCustomBackground(
    rawAppearance.customBackground ?? fallback.appearance.customBackground,
  );
  const normalizedStickers = normalizeStickers(
    rawAppearance.stickers ?? fallback.appearance.stickers,
  );

  return {
    version: typeof input.version === 'number' ? input.version : 7,
    updatedAt: typeof input.updatedAt === 'string' ? input.updatedAt : fallback.updatedAt,
    profile: {
      ...fallback.profile,
      ...(input.profile ?? {}),
      highlights: Array.isArray(input.profile?.highlights)
        ? input.profile.highlights
        : fallback.profile.highlights,
      socials: Array.isArray(input.profile?.socials)
        ? input.profile.socials
        : fallback.profile.socials,
    },
    skills,
    experiences,
    projects,
    achievements,
    education,
    appearance: {
      ...fallback.appearance,
      ...rawAppearance,
      stylePreset,
      skyBackdrop,
      portfolioLayout,
      borderRadius: rawAppearance.borderRadius ?? fallback.appearance.borderRadius ?? 'soft',
      heroLayout: rawAppearance.heroLayout ?? fallback.appearance.heroLayout ?? 'split',
      homeSectionOrder: mergeSectionOrder(
        rawAppearance.homeSectionOrder,
        DEFAULT_HOME_SECTION_ORDER,
      ),
      homeSections: {
        ...fallback.appearance.homeSections,
        ...rawHomeSections,
      },
      cvSettings: {
        ...fallback.appearance.cvSettings,
        ...rawCv,
        fontScale: rawCv.fontScale ?? fallback.appearance.cvSettings.fontScale ?? 'md',
        sectionOrder: mergeSectionOrder(rawCv.sectionOrder, DEFAULT_CV_SECTION_ORDER),
      },
      customBackground: normalizedCustomBg,
      stickers: normalizedStickers,
    },
    studioAccess: normalizedStudioAccess,
  };
}

export function createBlankPortfolioData(preserveStudioAccess?: StudioAccessConfig): PortfolioData {
  return {
    version: 7,
    updatedAt: new Date().toISOString(),
    profile: {
      fullName: 'Tên Của Bạn',
      monogram: 'ME',
      role: 'Chức danh / Lĩnh vực của bạn',
      tagline: 'Viết 1 câu ngắn gọn giới thiệu giá trị hoặc định hướng nghề nghiệp của bạn.',
      avatarUrl: '',
      location: 'Việt Nam',
      email: '',
      phone: '',
      website: '',
      availability: 'Sẵn sàng cho cơ hội hợp tác mới',
      showAvailability: false,
      aboutStory: '',
      cvSummary: '',
      highlights: [],
      socials: [],
    },
    skills: [],
    experiences: [],
    projects: [],
    achievements: [],
    education: [],
    appearance: {
      stylePreset: 'sky',
      skyBackdrop: 'cumulus',
      mode: 'dark',
      accentColor: '#1558C0',
      fontPreset: 'modern',
      borderRadius: 'soft',
      heroLayout: 'split',
      portfolioLayout: 'timeline',
      homeSectionOrder: [...DEFAULT_HOME_SECTION_ORDER],
      homeSections: {
        showHighlights: true,
        showStory: true,
        showFeatured: true,
        showSkills: true,
        showTimelinePreview: true,
        showContact: true,
      },
      cvSettings: {
        template: 'classic',
        fontScale: 'md',
        sectionOrder: [...DEFAULT_CV_SECTION_ORDER],
        showAvatar: true,
        showSummary: true,
        showExperience: true,
        showProjects: true,
        showAchievements: true,
        showEducation: true,
        showSkills: true,
        accentOnCV: true,
        compactMode: false,
      },
      customBackground: { ...DEFAULT_CUSTOM_BACKGROUND },
      stickers: [],
    },
    studioAccess: preserveStudioAccess ?? { passwordHash: DEFAULT_STUDIO_PASSWORD_HASH },
  };
}

export interface CompletenessCheck {
  label: string;
  done: boolean;
  targetSection: StudioSectionId;
}

export function getProfileCompleteness(data: PortfolioData): {
  percent: number;
  checks: CompletenessCheck[];
} {
  const { profile, projects, experiences, education, achievements } = data;
  const hasRealName =
    Boolean(profile.fullName.trim()) && profile.fullName.trim() !== 'Tên Của Bạn';
  const hasRole =
    Boolean(profile.role.trim()) && profile.role.trim() !== 'Chức danh / Lĩnh vực của bạn';

  const checks: CompletenessCheck[] = [
    {
      label: 'Họ tên & Chức danh cá nhân',
      done: hasRealName && hasRole,
      targetSection: 'profile',
    },
    {
      label: 'Email liên hệ & Câu chuyện bản thân',
      done: Boolean(profile.email.trim()) && Boolean(profile.aboutStory.trim()),
      targetSection: 'profile',
    },
    {
      label: 'Ảnh đại diện cá nhân',
      done: Boolean(profile.avatarUrl.trim()),
      targetSection: 'profile',
    },
    {
      label: 'Ít nhất 1 dự án hiển thị ở Portfolio',
      done: projects.some((p) => p.showInPortfolio),
      targetSection: 'projects',
    },
    {
      label: 'Kinh nghiệm hoặc Học vấn hiển thị ở CV',
      done: experiences.some((e) => e.showInCV) || education.some((ed) => ed.showInCV),
      targetSection: 'experiences',
    },
    {
      label: 'Ít nhất 1 thành tích / chứng chỉ',
      done: achievements.length > 0,
      targetSection: 'achievements',
    },
  ];

  const doneCount = checks.filter((c) => c.done).length;
  const percent = Math.round((doneCount / checks.length) * 100);
  return { percent, checks };
}
