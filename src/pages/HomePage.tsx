import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  Copy,
  Mail,
  MapPin,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { EditableRegion } from '../components/EditableRegion';
import { getSocialIcon } from '../components/FooterSocial';
import { PortfolioDetailModal, type PortfolioDetailTarget } from '../components/PortfolioDetailModal';
import { SkyAtmosphere } from '../components/SkyAtmosphere';
import {
  EmptyCloudIllustration,
  SkyHorizonDivider,
  SkyPortraitFrame,
  TimelineNodeGlyph,
} from '../components/SkyIllustrations';
import { StickerCanvasOverlay } from '../components/StickerCanvasOverlay';
import { VisualPlaceholder } from '../components/VisualPlaceholder';
import type {
  CanvasSticker,
  EditFocusTarget,
  HomeSectionKey,
  PortfolioData,
  RouteView,
  StudioSectionId,
  ThemeMode,
} from '../types/portfolio';
import { normalizeExternalUrl, resolveAssetUrl } from '../utils/assets';
import { getSkyBackdropAsset } from '../utils/theme';

interface HomePageProps {
  data: PortfolioData;
  activeMode?: ThemeMode;
  insideStudio?: boolean;
  clickToEdit?: boolean;
  onEditTarget?: (target: EditFocusTarget) => void;
  selectedStickerId?: string | null;
  onSelectSticker?: (id: string | null) => void;
  onUpdateSticker?: (id: string, patch: Partial<CanvasSticker>) => void;
  onDeleteSticker?: (id: string) => void;
  onDuplicateSticker?: (id: string) => void;
  onNavigate: (route: RouteView) => void;
  onNotify?: (type: 'success' | 'error' | 'info', text: string) => void;
}

type CategoryFilter = 'all' | 'project' | 'achievement' | 'experience';

interface TimelineEntry {
  id: string;
  rawId: string;
  section: StudioSectionId;
  kind: 'project' | 'achievement' | 'experience';
  kindLabel: string;
  title: string;
  subtitle: string;
  period: string;
  yearLabel: string;
  sortScore: number;
  summary: string;
  imageUrl: string;
  tags: string[];
  featured: boolean;
  raw: PortfolioDetailTarget;
}

function parseEntryYear(period: string): { yearLabel: string; sortScore: number } {
  const cleaned = period.trim();
  if (!cleaned) return { yearLabel: 'Khác', sortScore: 0 };

  const lower = cleaned.toLowerCase();
  if (lower.includes('hiện tại') || lower.includes('present') || lower.includes('now')) {
    const nowYear = new Date().getFullYear();
    return { yearLabel: String(nowYear), sortScore: nowYear * 100 + 99 };
  }

  const yearMatches = cleaned.match(/(?:19|20)\d{2}/g);
  if (!yearMatches || yearMatches.length === 0) {
    return { yearLabel: 'Khác', sortScore: 0 };
  }

  const latestYear = Math.max(...yearMatches.map((m) => Number.parseInt(m, 10)));
  const monthMatch = cleaned.match(/(?:tháng\s*)?(\d{1,2})\s*[\/\-]\s*(?:19|20)\d{2}/i);
  const month = monthMatch
    ? Math.min(12, Math.max(1, Number.parseInt(monthMatch[1], 10)))
    : 6;

  return {
    yearLabel: String(latestYear),
    sortScore: latestYear * 100 + month,
  };
}

export function HomePage({
  data,
  activeMode,
  insideStudio = false,
  clickToEdit = false,
  onEditTarget,
  selectedStickerId = null,
  onSelectSticker,
  onUpdateSticker,
  onDeleteSticker,
  onDuplicateSticker,
  onNavigate,
  onNotify,
}: HomePageProps) {
  const { profile, appearance, projects, achievements, experiences, skills } = data;
  const stageRef = useRef<HTMLDivElement | null>(null);

  const [category, setCategory] = useState<CategoryFilter>('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const effectiveMode = activeMode ?? appearance.mode;
  const skyAsset = getSkyBackdropAsset(appearance, effectiveMode);
  const isSkyTheme = skyAsset !== null;
  const isLightTextHero = Boolean(skyAsset?.isDarkHero);

  useEffect(() => {
    if (insideStudio) return;
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 520);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [insideStudio]);

  const triggerEdit = (section: StudioSectionId, itemId?: string) => {
    onEditTarget?.({ section, itemId, timestamp: Date.now() });
  };

  const avatarSrc = resolveAssetUrl(profile.avatarUrl);
  const storyParagraphs = profile.aboutStory
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const homeSkills = skills.filter((s) => s.showInHome);

  const entries = useMemo<TimelineEntry[]>(() => {
    const projectEntries: TimelineEntry[] = projects
      .filter((p) => p.showInPortfolio)
      .map((p) => {
        const parsed = parseEntryYear(p.period);
        return {
          id: `project-${p.id}`,
          rawId: p.id,
          section: 'projects',
          kind: 'project',
          kindLabel: p.category || 'Dự án',
          title: p.title,
          subtitle: p.subtitle || p.role,
          period: p.period,
          yearLabel: parsed.yearLabel,
          sortScore: parsed.sortScore,
          summary: p.shortDescription,
          imageUrl: p.thumbnailUrl,
          tags: p.tags,
          featured: p.featured,
          raw: { kind: 'project', item: p },
        };
      });

    const achievementEntries: TimelineEntry[] = achievements
      .filter((a) => a.showInPortfolio)
      .map((a) => {
        const parsed = parseEntryYear(a.date);
        return {
          id: `achievement-${a.id}`,
          rawId: a.id,
          section: 'achievements',
          kind: 'achievement',
          kindLabel: 'Thành tích',
          title: a.title,
          subtitle: a.issuer,
          period: a.date,
          yearLabel: parsed.yearLabel,
          sortScore: parsed.sortScore,
          summary: a.description,
          imageUrl: a.imageUrl,
          tags: a.tags,
          featured: a.featured,
          raw: { kind: 'achievement', item: a },
        };
      });

    const experienceEntries: TimelineEntry[] = experiences
      .filter((e) => e.showInPortfolio)
      .map((e) => {
        const parsed = parseEntryYear(e.period);
        return {
          id: `experience-${e.id}`,
          rawId: e.id,
          section: 'experiences',
          kind: 'experience',
          kindLabel: e.type || 'Kinh nghiệm',
          title: e.role,
          subtitle: e.organization,
          period: e.period,
          yearLabel: parsed.yearLabel,
          sortScore: parsed.sortScore,
          summary: e.summary,
          imageUrl: '',
          tags: e.tags,
          featured: false,
          raw: { kind: 'experience', item: e },
        };
      });

    return [...projectEntries, ...achievementEntries, ...experienceEntries].sort(
      (a, b) => b.sortScore - a.sortScore,
    );
  }, [projects, achievements, experiences]);

  const counts = useMemo(
    () => ({
      all: entries.length,
      project: entries.filter((e) => e.kind === 'project').length,
      achievement: entries.filter((e) => e.kind === 'achievement').length,
      experience: entries.filter((e) => e.kind === 'experience').length,
    }),
    [entries],
  );

  const filteredEntries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((entry) => {
      if (category !== 'all' && entry.kind !== category) return false;
      if (q) {
        const haystack = [
          entry.title,
          entry.subtitle,
          entry.summary,
          entry.kindLabel,
          entry.period,
          ...entry.tags,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [entries, category, query]);

  const groupedByYear = useMemo(() => {
    const groups: Array<{
      year: string;
      items: Array<{ entry: TimelineEntry; flatIndex: number }>;
    }> = [];
    const indexMap = new Map<string, number>();

    filteredEntries.forEach((entry, flatIndex) => {
      const existingIdx = indexMap.get(entry.yearLabel);
      if (existingIdx !== undefined) {
        groups[existingIdx].items.push({ entry, flatIndex });
      } else {
        indexMap.set(entry.yearLabel, groups.length);
        groups.push({ year: entry.yearLabel, items: [{ entry, flatIndex }] });
      }
    });

    return groups;
  }, [filteredEntries]);

  const rawCategoryTabs: Array<{ id: CategoryFilter; label: string; count: number }> = [
    { id: 'all', label: 'Tất cả', count: counts.all },
    { id: 'project', label: 'Dự án', count: counts.project },
    { id: 'achievement', label: 'Thành tích', count: counts.achievement },
    { id: 'experience', label: 'Kinh nghiệm', count: counts.experience },
  ];
  const categoryTabs = rawCategoryTabs.filter((tab) => tab.id === 'all' || tab.count > 0);

  const timelineLayout = appearance.portfolioLayout ?? 'timeline';
  const selectedEntry =
    selectedIndex !== null ? filteredEntries[selectedIndex] ?? null : null;

  const scrollToTimeline = () => {
    document
      .getElementById('portfolio-timeline')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const jumpToYear = (year: string) => {
    document
      .getElementById(`timeline-year-${year}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCopyEmail = async () => {
    if (!profile.email) return;
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopiedEmail(true);
      onNotify?.('success', `Đã sao chép email ${profile.email}`);
      window.setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      onNotify?.('info', `Email: ${profile.email}`);
    }
  };

  const heroHeadingClass = isLightTextHero
    ? 'text-white drop-shadow-[0_2px_12px_rgba(7,24,62,0.35)]'
    : isSkyTheme
      ? 'ink-primary drop-shadow-[0_1px_10px_rgba(255,255,255,0.85)]'
      : 'ink-primary';
  const heroBodyClass = isLightTextHero ? 'text-blue-50/95' : 'ink-secondary';
  const heroMutedClass = isLightTextHero ? 'text-blue-100/90' : 'ink-muted';

  const heroScrollCue = (centered = false) =>
    appearance.homeSections.showTimelinePreview ? (
      <div className={`pt-2 ${centered ? 'flex justify-center' : ''}`}>
        <button
          type="button"
          onClick={scrollToTimeline}
          aria-label="Cuộn xuống Hành trình và Dự án"
          title="Cuộn xuống Hành trình"
          className={`group inline-flex items-center gap-2 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-4 ${
            isLightTextHero
              ? 'text-blue-100/85 hover:text-white'
              : 'ink-muted hover:text-[var(--accent-text,var(--accent))]'
          }`}
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-current/25 transition group-hover:translate-y-0.5">
            <ArrowDown className="animate-float-gentle h-3.5 w-3.5" />
          </span>
          <span className="tracking-wide opacity-80 group-hover:opacity-100">
            Khám phá hành trình
          </span>
        </button>
      </div>
    ) : null;

  const socialStrip = (centered = false) => (
    <div
      className={`flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-xs ${heroMutedClass} ${
        centered ? 'justify-center' : ''
      }`}
    >
      {profile.location && (
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 opacity-80" />
          {profile.location}
        </span>
      )}
      {profile.socials.map((soc) => {
        const href = normalizeExternalUrl(soc.url);
        if (!href) return null;
        const Icon = getSocialIcon(soc.platform);
        return (
          <a
            key={soc.id}
            href={href}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center gap-1.5 font-medium transition ${
              isLightTextHero ? 'hover:text-white' : 'hover:text-accent'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{soc.label}</span>
          </a>
        );
      })}
    </div>
  );

  const availabilityIndicator =
    profile.showAvailability && profile.availability ? (
      <div className={`inline-flex items-center gap-2 text-xs font-medium ${heroMutedClass}`}>
        <span className="h-2 w-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
        <span>{profile.availability}</span>
      </div>
    ) : null;

  const portraitElement = (sizeClass = 'h-32 w-32 sm:h-40 sm:w-40') => (
    <SkyPortraitFrame mode={effectiveMode} isSkyTheme={isSkyTheme}>
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={profile.fullName}
          className={`${sizeClass} rounded-full object-cover shadow-2xl ${
            isLightTextHero
              ? 'ring-4 ring-white/80'
              : 'border border-token ring-4 ring-white'
          }`}
        />
      ) : (
        <VisualPlaceholder
          variant="avatar"
          title={profile.fullName}
          monogram={profile.monogram}
          className={`${sizeClass} rounded-full text-3xl shadow-2xl sm:text-4xl ${
            isLightTextHero ? 'ring-4 ring-white/80' : 'ring-4 ring-white'
          }`}
        />
      )}
    </SkyPortraitFrame>
  );

  const renderHero = () => {
    const heroLayout = appearance.heroLayout ?? 'split';

    if (heroLayout === 'centered') {
      return (
        <section className="mx-auto max-w-2xl space-y-5 py-3 text-center">
          <div className="flex justify-center">
            {portraitElement('h-28 w-28 sm:h-32 sm:w-32')}
          </div>
          {availabilityIndicator && (
            <div className="flex justify-center">{availabilityIndicator}</div>
          )}
          <div className="space-y-2.5">
            <h1
              className={`font-heading text-4xl leading-[1.08] font-bold tracking-tight sm:text-5xl ${heroHeadingClass}`}
            >
              {profile.fullName}
            </h1>
            <p className={`text-sm font-medium sm:text-base ${heroMutedClass}`}>
              {profile.role}
            </p>
            <p
              className={`mx-auto max-w-xl text-base leading-relaxed sm:text-lg ${heroBodyClass}`}
            >
              {profile.tagline}
            </p>
          </div>
          {socialStrip(true)}
          {heroScrollCue(true)}
        </section>
      );
    }

    if (heroLayout === 'card') {
      return (
        <section className="surface-glass radius-card border border-token p-6 sm:p-10">
          <div className="flex flex-col-reverse items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-xl space-y-4">
              {profile.showAvailability && profile.availability && (
                <div className="inline-flex items-center gap-2 text-xs font-medium ink-muted">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>{profile.availability}</span>
                </div>
              )}
              <div className="space-y-1.5">
                <h1 className="font-heading text-3xl leading-[1.1] font-bold tracking-tight ink-primary sm:text-5xl">
                  {profile.fullName}
                </h1>
                <p className="font-heading text-base font-semibold text-accent-safe sm:text-lg">
                  {profile.role}
                </p>
              </div>
              <p className="text-base leading-relaxed ink-secondary">{profile.tagline}</p>
              {profile.location && (
                <p className="inline-flex items-center gap-1.5 text-xs ink-muted">
                  <MapPin className="h-3.5 w-3.5 opacity-80" />
                  {profile.location}
                </p>
              )}
            </div>
            <div className="shrink-0">
              <SkyPortraitFrame mode={effectiveMode} isSkyTheme={isSkyTheme}>
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={profile.fullName}
                    className="h-28 w-28 rounded-full border border-token object-cover shadow-lg sm:h-36 sm:w-36"
                  />
                ) : (
                  <VisualPlaceholder
                    variant="avatar"
                    title={profile.fullName}
                    monogram={profile.monogram}
                    className="h-28 w-28 rounded-full text-3xl shadow-lg sm:h-36 sm:w-36"
                  />
                )}
              </SkyPortraitFrame>
            </div>
          </div>
        </section>
      );
    }

    // Default 'split' — Airy Sky Editorial Hero
    return (
      <section className="flex flex-col-reverse items-start justify-between gap-8 py-3 md:flex-row md:items-center md:gap-12">
        <div className="max-w-2xl space-y-5">
          {availabilityIndicator}
          <div className="space-y-2.5">
            <h1
              className={`font-heading text-4xl leading-[1.08] font-bold tracking-tight sm:text-5xl lg:text-[54px] ${heroHeadingClass}`}
            >
              {profile.fullName}
            </h1>
            <p className={`font-heading text-base font-medium sm:text-lg ${heroMutedClass}`}>
              {profile.role}
            </p>
          </div>
          <p className={`max-w-xl text-base leading-relaxed sm:text-lg ${heroBodyClass}`}>
            {profile.tagline}
          </p>
          {socialStrip(false)}
          {heroScrollCue(false)}
        </div>

        <div className="shrink-0 self-start md:self-center">
          {portraitElement('h-28 w-28 sm:h-40 sm:w-40')}
        </div>
      </section>
    );
  };

  const renderSectionByKey = (key: HomeSectionKey): ReactNode => {
    if (key === 'highlights') {
      if (!appearance.homeSections.showHighlights || profile.highlights.length === 0) {
        return null;
      }
      const highlightCount = profile.highlights.length;
      const highlightGridCols =
        highlightCount === 1
          ? 'grid-cols-1'
          : highlightCount === 2
            ? 'sm:grid-cols-2 sm:divide-x sm:divide-y-0'
            : highlightCount === 3
              ? 'sm:grid-cols-3 sm:divide-x sm:divide-y-0'
              : 'sm:grid-cols-2 lg:grid-cols-4 sm:divide-x sm:divide-y-0';
      return (
        <EditableRegion
          key="highlights"
          active={clickToEdit}
          label="Con số nổi bật"
          onEdit={() => triggerEdit('profile')}
        >
          <section
            className={`surface-glass radius-card grid divide-y divide-[var(--border-subtle)] border border-token ${highlightGridCols}`}
          >
            {profile.highlights.map((item) => (
              <div
                key={item.id}
                className={`px-6 py-5 ${
                  highlightCount === 1 ? 'text-center' : 'text-center sm:text-left'
                }`}
              >
                <p className="font-heading text-2xl font-bold text-accent-safe sm:text-3xl">
                  {item.value}
                </p>
                <p className="mt-1 text-xs font-medium ink-secondary sm:text-sm">{item.label}</p>
              </div>
            ))}
          </section>
        </EditableRegion>
      );
    }

    if (key === 'story') {
      if (!appearance.homeSections.showStory || storyParagraphs.length === 0) {
        return null;
      }
      return (
        <EditableRegion
          key="story"
          active={clickToEdit}
          label="Câu chuyện bản thân"
          onEdit={() => triggerEdit('profile')}
        >
          <section className="surface-glass radius-card grid gap-6 border border-token p-6 sm:p-8 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="text-xs font-semibold tracking-wider text-accent-safe uppercase">
                Giới thiệu
              </p>
              <h2 className="font-heading mt-1.5 text-2xl font-bold ink-primary">
                Đôi nét về mình
              </h2>
            </div>
            <div className="space-y-4 md:col-span-8">
              {storyParagraphs.map((paragraph, idx) => (
                <p key={idx} className="text-base leading-relaxed ink-secondary">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        </EditableRegion>
      );
    }

    if (key === 'timeline') {
      if (!appearance.homeSections.showTimelinePreview) {
        return null;
      }
      return (
        <section
          key="timeline"
          id="portfolio-timeline"
          className="scroll-mt-24 space-y-7 pt-2"
        >
          {/* Timeline Section Heading */}
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold tracking-wider text-accent-safe uppercase">
                Portfolio
              </p>
              <h2 className="font-heading mt-1 text-2xl font-bold ink-primary sm:text-3xl">
                Hành trình &amp; Dự án
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('cv')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-safe transition hover:underline sm:text-sm"
            >
              <span>Xem bản CV chuẩn A4</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Quiet Filter & Year Jump Bar */}
          <div className="surface-glass radius-card flex flex-col gap-3 border border-token px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              {categoryTabs.map((tab) => {
                const active = category === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setCategory(tab.id);
                      setSelectedIndex(null);
                    }}
                    className={`relative py-1 text-xs transition sm:text-sm ${
                      active ? 'font-semibold ink-primary' : 'ink-muted hover:ink-primary'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <sup className="ml-1 font-mono text-[10px] opacity-65">{tab.count}</sup>
                    {active && (
                      <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-accent" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              {groupedByYear.length > 1 && (
                <div className="flex items-center gap-2 text-xs ink-muted">
                  {groupedByYear.map((g, i) => (
                    <span key={g.year} className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => jumpToYear(g.year)}
                        className="font-mono font-medium transition hover:text-[var(--accent-text,var(--accent))]"
                      >
                        {g.year}
                      </button>
                      {i < groupedByYear.length - 1 && <span className="opacity-35">·</span>}
                    </span>
                  ))}
                </div>
              )}

              {searchOpen ? (
                <div className="relative flex items-center">
                  <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 ink-muted" />
                  <input
                    type="text"
                    autoFocus
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setSelectedIndex(null);
                    }}
                    placeholder="Tìm kiếm..."
                    className="w-40 rounded-full border border-token bg-[var(--bg-surface)] py-1 pr-7 pl-8 text-xs ink-primary outline-none focus:border-[var(--accent)] sm:w-48"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setSearchOpen(false);
                    }}
                    aria-label="Đóng tìm kiếm"
                    className="absolute right-2 rounded-full p-0.5 ink-muted hover:ink-primary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Tìm trong Portfolio"
                  title="Tìm nhanh theo tên, vai trò hoặc từ khóa"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full ink-muted transition hover:surface-subtle hover:ink-primary"
                >
                  <Search className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Chronological Timeline Content */}
          {filteredEntries.length === 0 ? (
            <EmptyCloudIllustration
              title={entries.length === 0 ? 'Chưa có mục nào hiển thị' : 'Không tìm thấy dấu mốc phù hợp'}
              subtitle={
                entries.length === 0
                  ? 'Mở Local Studio để thêm dự án, thành tích mới hoặc bật "Hiện ở Portfolio".'
                  : 'Thử xóa từ khóa tìm kiếm hoặc chuyển sang tab "Tất cả" để xem lại toàn bộ.'
              }
            />
          ) : timelineLayout === 'minimal-grid' ? (
            <div className="space-y-10">
              {groupedByYear.map((group) => (
                <div
                  key={group.year}
                  id={`timeline-year-${group.year}`}
                  className="scroll-mt-24 space-y-4"
                >
                  <div className="flex items-center gap-4">
                    <h3 className="font-heading text-2xl font-bold tracking-tight text-accent-safe">
                      {group.year}
                    </h3>
                    <div className="h-px flex-1 bg-[var(--border-subtle)]" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {group.items.map(({ entry, flatIndex }) => (
                      <EditableRegion
                        key={entry.id}
                        active={clickToEdit}
                        label={entry.title}
                        onEdit={() =>
                          onEditTarget?.({
                            section: entry.section,
                            itemId: entry.rawId,
                            timestamp: Date.now(),
                          })
                        }
                      >
                        <TimelineCard
                          entry={entry}
                          compact
                          onSelect={() => setSelectedIndex(flatIndex)}
                        />
                      </EditableRegion>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : timelineLayout === 'timeline-alt' ? (
            <div className="space-y-12">
              {groupedByYear.map((group) => (
                <div
                  key={group.year}
                  id={`timeline-year-${group.year}`}
                  className="scroll-mt-24 space-y-6"
                >
                  <div className="flex items-center justify-center gap-4">
                    <div className="h-px flex-1 bg-[var(--border-subtle)]" />
                    <span className="surface-glass rounded-full border border-token px-4 py-1.5 font-mono text-sm font-bold text-accent-safe shadow-sm">
                      {group.year}
                    </span>
                    <div className="h-px flex-1 bg-[var(--border-subtle)]" />
                  </div>

                  <div className="relative space-y-6 pl-8 md:pl-0">
                    <div
                      aria-hidden="true"
                      className="timeline-spine spine-shimmer absolute top-2 bottom-2 left-3 w-px md:left-1/2 md:-translate-x-1/2"
                    />

                    {group.items.map(({ entry, flatIndex }, idx) => {
                      const onRight = idx % 2 === 1;
                      return (
                        <div
                          key={entry.id}
                          className="group relative md:grid md:grid-cols-2 md:gap-10"
                        >
                          <div
                            aria-hidden="true"
                            className={`absolute z-10 md:left-1/2 md:-translate-x-1/2 ${
                              isSkyTheme ? 'top-5 -left-[31px]' : 'top-6 -left-[25px]'
                            }`}
                          >
                            <TimelineNodeGlyph
                              kind={entry.kind}
                              featured={entry.featured}
                              isSkyTheme={isSkyTheme}
                            />
                          </div>

                          <div className={onRight ? 'md:col-start-2' : 'md:col-start-1'}>
                            <EditableRegion
                              active={clickToEdit}
                              label={entry.title}
                              onEdit={() =>
                                onEditTarget?.({
                                  section: entry.section,
                                  itemId: entry.rawId,
                                  timestamp: Date.now(),
                                })
                              }
                            >
                              <TimelineCard
                                entry={entry}
                                onSelect={() => setSelectedIndex(flatIndex)}
                              />
                            </EditableRegion>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Default: Left-Spine Chronological Timeline */
            <div className="space-y-12">
              {groupedByYear.map((group) => (
                <div
                  key={group.year}
                  id={`timeline-year-${group.year}`}
                  className="scroll-mt-24 grid gap-4 md:grid-cols-12 md:gap-8"
                >
                  <div className="md:col-span-2">
                    <div className="md:sticky md:top-24">
                      <div className="surface-glass inline-flex items-baseline gap-2.5 rounded-2xl border border-token px-4 py-2.5 shadow-sm md:flex md:flex-col md:items-start md:gap-0.5">
                        <h3 className="font-heading text-2xl font-bold tracking-tight text-accent-safe sm:text-3xl">
                          {group.year}
                        </h3>
                        <p className="text-xs font-medium ink-secondary">
                          {group.items.length} dấu mốc
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative space-y-5 pl-8 md:col-span-10">
                    <div
                      aria-hidden="true"
                      className="timeline-spine spine-shimmer absolute top-2 bottom-2 left-3 w-px"
                    />

                    {group.items.map(({ entry, flatIndex }) => (
                      <div key={entry.id} className="group relative">
                        <div
                          aria-hidden="true"
                          className={`absolute z-10 ${
                            isSkyTheme ? 'top-5 -left-[31px]' : 'top-6 -left-[25px]'
                          }`}
                        >
                          <TimelineNodeGlyph
                            kind={entry.kind}
                            featured={entry.featured}
                            isSkyTheme={isSkyTheme}
                          />
                        </div>

                        <EditableRegion
                          active={clickToEdit}
                          label={entry.title}
                          onEdit={() =>
                            onEditTarget?.({
                              section: entry.section,
                              itemId: entry.rawId,
                              timestamp: Date.now(),
                            })
                          }
                        >
                          <TimelineCard
                            entry={entry}
                            onSelect={() => setSelectedIndex(flatIndex)}
                          />
                        </EditableRegion>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      );
    }

    if (key === 'skills') {
      if (!appearance.homeSections.showSkills || homeSkills.length === 0) {
        return null;
      }
      return (
        <EditableRegion
          key="skills"
          active={clickToEdit}
          label="Kỹ năng & công cụ"
          onEdit={() => triggerEdit('eduSkills')}
        >
          <section className="grid gap-6 pt-2 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="text-xs font-semibold tracking-wider text-accent-safe uppercase">
                Năng lực
              </p>
              <h2 className="font-heading mt-1.5 text-2xl font-bold ink-primary">
                Kỹ năng chính
              </h2>
            </div>
            <div className="space-y-3 md:col-span-8">
              {homeSkills.map((group) => (
                <div
                  key={group.id}
                  className="surface-glass radius-card flex flex-col gap-1 border border-token px-5 py-4 sm:flex-row sm:items-baseline sm:gap-4"
                >
                  <span className="min-w-[150px] text-sm font-semibold ink-primary">
                    {group.category}
                  </span>
                  <span className="text-sm ink-secondary">{group.skills.join(' · ')}</span>
                </div>
              ))}
            </div>
          </section>
        </EditableRegion>
      );
    }

    if (key === 'contact') {
      if (!appearance.homeSections.showContact) return null;
      return (
        <EditableRegion
          key="contact"
          active={clickToEdit}
          label="Thông tin liên hệ"
          onEdit={() => triggerEdit('profile')}
        >
          <section className="surface-glass radius-card flex flex-col items-start justify-between gap-5 border border-token p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="space-y-1">
              <h2 className="font-heading text-xl font-bold ink-primary sm:text-2xl">
                Trao đổi về dự án hoặc cơ hội hợp tác?
              </h2>
              <p className="text-sm ink-secondary">
                Nhấn để sao chép email hoặc{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('cv')}
                  className="font-semibold text-accent-safe hover:underline"
                >
                  mở CV chuẩn A4 →
                </button>
              </p>
            </div>

            {profile.email && (
              <button
                type="button"
                onClick={handleCopyEmail}
                className="radius-btn sky-btn-primary inline-flex shrink-0 items-center gap-2 px-5 py-2.5 text-sm font-semibold"
              >
                {copiedEmail ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                <span>{copiedEmail ? 'Đã sao chép email' : profile.email}</span>
                {!copiedEmail && <Copy className="h-3.5 w-3.5 opacity-75" />}
              </button>
            )}
          </section>
        </EditableRegion>
      );
    }

    return null;
  };

  const rawOrder = appearance.homeSectionOrder ?? [
    'highlights',
    'story',
    'timeline',
    'skills',
    'contact',
  ];
  const sectionOrder = rawOrder.filter(
    (k): k is HomeSectionKey =>
      k === 'highlights' ||
      k === 'story' ||
      k === 'timeline' ||
      k === 'skills' ||
      k === 'contact',
  );

  const stickers = appearance.stickers ?? [];

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <SkyAtmosphere
        appearance={appearance}
        mode={effectiveMode}
        variant="full"
        insideStudio={insideStudio}
      />

      <div
        ref={stageRef}
        onClick={() => {
          if (insideStudio) {
            onSelectSticker?.(null);
          }
        }}
        className="relative mx-auto max-w-6xl"
      >
        <StickerCanvasOverlay
          stickers={stickers}
          stageRef={stageRef}
          layer="behind"
          editable={insideStudio}
          selectedId={selectedStickerId}
          onSelect={onSelectSticker}
          onUpdate={onUpdateSticker}
          onDelete={onDeleteSticker}
          onDuplicate={onDuplicateSticker}
        />

        <div
          className={`relative z-10 mx-auto max-w-5xl space-y-14 px-4 pb-16 sm:px-6 ${
            insideStudio ? 'pt-10 sm:pt-14' : 'pt-24 sm:pt-28'
          }`}
        >
          <EditableRegion
            active={clickToEdit}
            label="Thông tin cá nhân & Hero"
            onEdit={() => triggerEdit('profile')}
          >
            {renderHero()}
          </EditableRegion>

          {sectionOrder.map((key) => renderSectionByKey(key))}
        </div>

        <StickerCanvasOverlay
          stickers={stickers}
          stageRef={stageRef}
          layer="front"
          editable={insideStudio}
          selectedId={selectedStickerId}
          onSelect={onSelectSticker}
          onUpdate={onUpdateSticker}
          onDelete={onDeleteSticker}
          onDuplicate={onDuplicateSticker}
        />
      </div>

      <SkyHorizonDivider appearance={appearance} mode={effectiveMode} />

      {/* Subtle Back-to-Top Pill */}
      {!insideStudio && showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Lên đầu trang"
          title="Lên đầu trang"
          className="no-print sky-btn-glass fixed right-5 bottom-5 z-30 inline-flex h-10 w-10 items-center justify-center rounded-full"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}

      <PortfolioDetailModal
        target={selectedEntry?.raw ?? null}
        onClose={() => setSelectedIndex(null)}
        onPrev={
          selectedIndex !== null && selectedIndex > 0
            ? () => setSelectedIndex(selectedIndex - 1)
            : undefined
        }
        onNext={
          selectedIndex !== null && selectedIndex < filteredEntries.length - 1
            ? () => setSelectedIndex(selectedIndex + 1)
            : undefined
        }
        positionLabel={
          selectedIndex !== null ? `${selectedIndex + 1} / ${filteredEntries.length}` : undefined
        }
      />
    </div>
  );
}

function TimelineCard({
  entry,
  compact = false,
  onSelect,
}: {
  entry: TimelineEntry;
  compact?: boolean;
  onSelect: () => void;
}) {
  const image = resolveAssetUrl(entry.imageUrl);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group surface-glass radius-card flex w-full flex-col gap-4 border border-token p-5 text-left transition hover:-translate-y-0.5 hover:border-token-strong sm:flex-row sm:items-center sm:justify-between sm:p-6"
    >
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {entry.period && (
            <span className="font-mono font-medium ink-muted">{entry.period}</span>
          )}
          <span className="ink-muted opacity-40">·</span>
          <span className="font-medium text-accent-safe">{entry.kindLabel}</span>
          {entry.featured && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-300">
              <Sparkles className="h-3 w-3" />
              Tiêu biểu
            </span>
          )}
        </div>

        <div>
          <h3 className="font-heading text-lg font-bold ink-primary transition group-hover:text-[var(--accent-text,var(--accent))]">
            {entry.title}
          </h3>
          {entry.subtitle && (
            <p className="mt-0.5 text-xs font-medium ink-muted">{entry.subtitle}</p>
          )}
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed ink-secondary">
          {entry.summary}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {entry.tags.length > 0 ? (
            <p className="text-xs ink-muted">{entry.tags.slice(0, 3).join(' · ')}</p>
          ) : (
            <span />
          )}

          <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent-safe opacity-85 transition group-hover:translate-x-0.5 group-hover:opacity-100">
            Xem chi tiết
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      {image && !compact && (
        <div className="h-36 w-full shrink-0 overflow-hidden rounded-xl border border-token sm:h-28 sm:w-44">
          <img
            src={image}
            alt={entry.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
      )}
    </button>
  );
}
