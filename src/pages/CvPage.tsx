import { type ReactNode, useEffect, useRef, useState } from 'react';
import { ExternalLink, Globe, Mail, MapPin, Phone, Printer } from 'lucide-react';
import { EditableRegion } from '../components/EditableRegion';
import { SkyAtmosphere } from '../components/SkyAtmosphere';
import { VisualPlaceholder } from '../components/VisualPlaceholder';
import type {
  CvFontScale,
  CvSectionKey,
  EditFocusTarget,
  PortfolioData,
  StudioSectionId,
  ThemeMode,
} from '../types/portfolio';
import { normalizeExternalUrl, resolveAssetUrl } from '../utils/assets';
import { getSkyBackdropAsset } from '../utils/theme';

interface CvPageProps {
  data: PortfolioData;
  activeMode?: ThemeMode;
  insideStudio?: boolean;
  clickToEdit?: boolean;
  onEditTarget?: (target: EditFocusTarget) => void;
}

const FONT_SCALE_CLASS: Record<CvFontScale, string> = {
  sm: 'text-[12.5px]',
  md: 'text-[13.5px]',
  lg: 'text-[14.5px]',
};

const TEMPLATE_NAME: Record<PortfolioData['appearance']['cvSettings']['template'], string> = {
  classic: '1 cột chuẩn ATS',
  'modern-split': '2 cột hiện đại',
  executive: 'Executive Thụy Sĩ',
};

const A4_PAGE_HEIGHT_PX = 1122; // 297mm @ 96dpi

export function CvPage({
  data,
  activeMode,
  insideStudio = false,
  clickToEdit = false,
  onEditTarget,
}: CvPageProps) {
  const { profile, experiences, projects, achievements, education, skills, appearance } = data;
  const { cvSettings } = appearance;
  const sheetRef = useRef<HTMLElement | null>(null);
  const [estimatedPages, setEstimatedPages] = useState(1);

  const effectiveMode = activeMode ?? appearance.mode;
  const skyAsset = getSkyBackdropAsset(appearance, effectiveMode);
  const isLightTextHeader = Boolean(skyAsset?.isDarkHero);

  const triggerEdit = (section: StudioSectionId, itemId?: string) => {
    onEditTarget?.({ section, itemId, timestamp: Date.now() });
  };

  useEffect(() => {
    const el = sheetRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const measure = () => {
      const height = el.getBoundingClientRect().height;
      setEstimatedPages(Math.max(1, Math.ceil((height - 24) / A4_PAGE_HEIGHT_PX)));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [data]);

  const cvExperiences = experiences.filter((e) => e.showInCV);
  const cvProjects = projects.filter((p) => p.showInCV);
  const cvAchievements = achievements.filter((a) => a.showInCV);
  const cvEducation = education.filter((e) => e.showInCV);
  const cvSkills = skills.filter((s) => s.showInCV);

  const avatarSrc = resolveAssetUrl(profile.avatarUrl);
  const accentHeadingColor = cvSettings.accentOnCV ? 'var(--accent)' : '#18181b';
  const compact = cvSettings.compactMode;
  const scaleClass = FONT_SCALE_CLASS[cvSettings.fontScale ?? 'md'];
  const sectionOrder = cvSettings.sectionOrder ?? [
    'summary',
    'experience',
    'projects',
    'skills',
    'education',
    'achievements',
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="relative overflow-x-hidden print:overflow-visible">
      <SkyAtmosphere appearance={appearance} mode={effectiveMode} variant="cv" />

      <div
        className={`relative z-10 mx-auto max-w-5xl px-4 pb-12 sm:px-6 print:p-0 ${
          insideStudio ? 'pt-8 sm:pt-10' : 'pt-24 sm:pt-28'
        }`}
      >
        {/* Minimal Borderless Action Strip */}
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1
                className={`font-heading text-xl font-bold ${
                  isLightTextHeader ? 'text-white drop-shadow-sm' : 'ink-primary'
                }`}
              >
                Hồ sơ CV chuẩn A4
              </h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  isLightTextHeader
                    ? 'bg-white/20 text-white backdrop-blur-sm'
                    : estimatedPages === 1
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                }`}
              >
                {estimatedPages === 1
                  ? 'Vừa khít 1 trang'
                  : `~${estimatedPages} trang A4`}
              </span>
            </div>
            <p
              className={`text-xs ${
                isLightTextHeader ? 'text-blue-100/85' : 'ink-muted'
              }`}
            >
              Mẫu {TEMPLATE_NAME[cvSettings.template] ?? '1 cột chuẩn ATS'}
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className={`radius-btn inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold shadow-sm transition hover:opacity-90 sm:text-sm ${
              isLightTextHeader ? 'bg-white text-[#0C1F3C]' : 'bg-accent'
            }`}
          >
            <Printer className="h-4 w-4" />
            <span>Tải PDF / In</span>
          </button>
        </div>

      {/* A4 Paper Surface */}
      <article
        ref={sheetRef}
        className={`cv-sheet mx-auto w-full max-w-[210mm] rounded-xl border border-zinc-200 bg-white text-zinc-900 shadow-lg ${
          compact ? 'p-7 sm:p-9' : 'p-8 sm:p-11'
        } ${scaleClass} min-h-[297mm]`}
      >
        {cvSettings.template === 'modern-split' ? (
          <ModernSplitCv
            profile={profile}
            avatarSrc={avatarSrc}
            cvSettings={cvSettings}
            accentHeadingColor={accentHeadingColor}
            sectionOrder={sectionOrder}
            experiences={cvExperiences}
            projects={cvProjects}
            achievements={cvAchievements}
            education={cvEducation}
            skills={cvSkills}
            clickToEdit={clickToEdit}
            onEdit={triggerEdit}
          />
        ) : cvSettings.template === 'executive' ? (
          <ExecutiveCv
            profile={profile}
            avatarSrc={avatarSrc}
            cvSettings={cvSettings}
            accentHeadingColor={accentHeadingColor}
            sectionOrder={sectionOrder}
            experiences={cvExperiences}
            projects={cvProjects}
            achievements={cvAchievements}
            education={cvEducation}
            skills={cvSkills}
            clickToEdit={clickToEdit}
            onEdit={triggerEdit}
          />
        ) : (
          <ClassicCv
            profile={profile}
            avatarSrc={avatarSrc}
            cvSettings={cvSettings}
            accentHeadingColor={accentHeadingColor}
            sectionOrder={sectionOrder}
            experiences={cvExperiences}
            projects={cvProjects}
            achievements={cvAchievements}
            education={cvEducation}
            skills={cvSkills}
            clickToEdit={clickToEdit}
            onEdit={triggerEdit}
          />
        )}
      </article>
      </div>
    </div>
  );
}

interface TemplateProps {
  profile: PortfolioData['profile'];
  avatarSrc: string;
  cvSettings: PortfolioData['appearance']['cvSettings'];
  accentHeadingColor: string;
  sectionOrder: CvSectionKey[];
  experiences: PortfolioData['experiences'];
  projects: PortfolioData['projects'];
  achievements: PortfolioData['achievements'];
  education: PortfolioData['education'];
  skills: PortfolioData['skills'];
  clickToEdit: boolean;
  onEdit: (section: StudioSectionId, itemId?: string) => void;
}

function CvSectionTitle({ title, color }: { title: string; color: string }) {
  return (
    <h2
      className="font-heading mb-2.5 border-b pb-1 text-[11px] font-bold tracking-wider uppercase"
      style={{ color, borderColor: 'rgba(24, 24, 27, 0.14)' }}
    >
      {title}
    </h2>
  );
}

function CvContactLinks({
  profile,
  centered = false,
}: {
  profile: PortfolioData['profile'];
  centered?: boolean;
}) {
  const websiteHref = normalizeExternalUrl(profile.website);

  return (
    <div
      className={`flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600 ${
        centered ? 'justify-center' : ''
      }`}
    >
      {profile.email && (
        <a
          href={`mailto:${profile.email}`}
          className="inline-flex items-center gap-1 hover:underline"
        >
          <Mail className="h-3.5 w-3.5" />
          {profile.email}
        </a>
      )}
      {profile.phone && (
        <a
          href={`tel:${profile.phone.replace(/\s+/g, '')}`}
          className="inline-flex items-center gap-1 hover:underline"
        >
          <Phone className="h-3.5 w-3.5" />
          {profile.phone}
        </a>
      )}
      {profile.location && (
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {profile.location}
        </span>
      )}
      {websiteHref && (
        <a
          href={websiteHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 hover:underline"
        >
          <Globe className="h-3.5 w-3.5" />
          {profile.website.replace(/^https?:\/\//, '')}
        </a>
      )}
      {profile.socials.slice(0, 2).map((soc) => {
        const href = normalizeExternalUrl(soc.url);
        if (!href) return null;
        return (
          <a
            key={soc.id}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            {soc.label}
          </a>
        );
      })}
    </div>
  );
}

function renderCvSectionContent(
  key: CvSectionKey,
  props: TemplateProps,
): { title: string; body: ReactNode; editSection: StudioSectionId } | null {
  const {
    profile,
    cvSettings,
    experiences,
    projects,
    achievements,
    education,
    skills,
  } = props;

  if (key === 'summary') {
    if (!cvSettings.showSummary || !profile.cvSummary) return null;
    return {
      title: 'Tóm tắt chuyên môn',
      editSection: 'profile',
      body: <p className="leading-relaxed text-zinc-700">{profile.cvSummary}</p>,
    };
  }

  if (key === 'experience') {
    if (!cvSettings.showExperience || experiences.length === 0) return null;
    return {
      title: 'Kinh nghiệm làm việc',
      editSection: 'experiences',
      body: (
        <div className="space-y-4">
          {experiences.map((exp) => {
            const nonEmptyBullets = exp.bullets.filter((b) => b.trim() !== '');
            return (
              <div key={exp.id} className="cv-entry">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <span className="font-heading font-bold text-zinc-900">{exp.role}</span>
                    <span className="text-zinc-600"> — {exp.organization}</span>
                  </div>
                  <span className="text-xs font-medium text-zinc-500">{exp.period}</span>
                </div>
                {exp.location && (
                  <p className="text-xs text-zinc-500">
                    {[exp.type, exp.location].filter(Boolean).join(' • ')}
                  </p>
                )}
                {nonEmptyBullets.length > 0 ? (
                  <ul className="mt-1.5 list-disc space-y-1 pl-4 text-zinc-700">
                    {nonEmptyBullets.map((bullet, idx) => (
                      <li key={idx} className="leading-snug">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : (
                  exp.summary && <p className="mt-1 text-zinc-700">{exp.summary}</p>
                )}
              </div>
            );
          })}
        </div>
      ),
    };
  }

  if (key === 'projects') {
    if (!cvSettings.showProjects || projects.length === 0) return null;
    return {
      title: 'Dự án tiêu biểu',
      editSection: 'projects',
      body: (
        <div className="space-y-3">
          {projects.map((proj) => {
            const projLink = normalizeExternalUrl(proj.liveUrl || proj.repoUrl);
            return (
              <div key={proj.id} className="cv-entry">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    {projLink ? (
                      <a
                        href={projLink}
                        target="_blank"
                        rel="noreferrer"
                        className="font-heading font-bold text-zinc-900 hover:underline"
                      >
                        {proj.title}
                      </a>
                    ) : (
                      <span className="font-heading font-bold text-zinc-900">{proj.title}</span>
                    )}
                    {proj.role && <span className="text-xs text-zinc-500"> • {proj.role}</span>}
                  </div>
                  <span className="text-xs font-medium text-zinc-500">{proj.period}</span>
                </div>
                <p className="mt-1 leading-snug text-zinc-700">
                  {proj.cvSummary || proj.shortDescription}
                </p>
                {proj.tags.length > 0 && (
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Từ khóa: {proj.tags.join(', ')}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ),
    };
  }

  if (key === 'skills') {
    if (!cvSettings.showSkills || skills.length === 0) return null;
    return {
      title: 'Kỹ năng',
      editSection: 'eduSkills',
      body: (
        <div className="space-y-1.5">
          {skills.map((group) => (
            <div key={group.id} className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
              <span className="min-w-[160px] font-semibold text-zinc-900">
                {group.category}:
              </span>
              <span className="text-zinc-700">{group.skills.join(', ')}</span>
            </div>
          ))}
        </div>
      ),
    };
  }

  if (key === 'education') {
    if (!cvSettings.showEducation || education.length === 0) return null;
    return {
      title: 'Học vấn',
      editSection: 'eduSkills',
      body: (
        <div className="space-y-2.5">
          {education.map((edu) => (
            <div key={edu.id} className="cv-entry">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <span className="font-heading font-bold text-zinc-900">{edu.school}</span>
                  <span className="text-zinc-700"> — {edu.degree}</span>
                </div>
                <span className="text-xs font-medium text-zinc-500">{edu.period}</span>
              </div>
              {edu.gpaOrHonors && (
                <p className="mt-0.5 text-xs font-medium text-zinc-600">{edu.gpaOrHonors}</p>
              )}
              {edu.details && <p className="mt-0.5 text-zinc-700">{edu.details}</p>}
            </div>
          ))}
        </div>
      ),
    };
  }

  if (key === 'achievements') {
    if (!cvSettings.showAchievements || achievements.length === 0) return null;
    return {
      title: 'Thành tích & Chứng chỉ',
      editSection: 'achievements',
      body: (
        <ul className="space-y-1.5">
          {achievements.map((ach) => {
            const credHref = normalizeExternalUrl(ach.credentialUrl);
            return (
              <li key={ach.id} className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-zinc-800">
                  {credHref ? (
                    <a
                      href={credHref}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold hover:underline"
                    >
                      {ach.cvNote || ach.title}
                    </a>
                  ) : (
                    <strong className="font-semibold">{ach.cvNote || ach.title}</strong>
                  )}
                  {ach.issuer ? ` — ${ach.issuer}` : ''}
                </span>
                {ach.date && <span className="text-xs text-zinc-500">{ach.date}</span>}
              </li>
            );
          })}
        </ul>
      ),
    };
  }

  return null;
}

function ClassicCv(props: TemplateProps) {
  const { profile, avatarSrc, cvSettings, accentHeadingColor, sectionOrder, clickToEdit, onEdit } =
    props;
  const spacing = cvSettings.compactMode ? 'space-y-4' : 'space-y-6';

  return (
    <div className={spacing}>
      <EditableRegion
        active={clickToEdit}
        label="Thông tin đầu CV"
        onEdit={() => onEdit('profile')}
      >
        <header className="flex items-start justify-between gap-5 border-b border-zinc-200 pb-5">
          <div className="space-y-2">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
              {profile.fullName}
            </h1>
            <p className="text-base font-semibold" style={{ color: accentHeadingColor }}>
              {profile.role}
            </p>
            <CvContactLinks profile={profile} />
          </div>

          {cvSettings.showAvatar && (
            <div className="shrink-0">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={profile.fullName}
                  className="h-20 w-20 rounded-xl border border-zinc-200 object-cover"
                />
              ) : (
                <VisualPlaceholder
                  variant="avatar"
                  title={profile.fullName}
                  monogram={profile.monogram}
                  className="h-20 w-20 rounded-xl text-xl"
                />
              )}
            </div>
          )}
        </header>
      </EditableRegion>

      {sectionOrder.map((key) => {
        const rendered = renderCvSectionContent(key, props);
        if (!rendered) return null;
        return (
          <EditableRegion
            key={key}
            active={clickToEdit}
            label={rendered.title}
            onEdit={() => onEdit(rendered.editSection)}
          >
            <section className="cv-entry">
              <CvSectionTitle title={rendered.title} color={accentHeadingColor} />
              {rendered.body}
            </section>
          </EditableRegion>
        );
      })}
    </div>
  );
}

function ExecutiveCv(props: TemplateProps) {
  const { profile, avatarSrc, cvSettings, accentHeadingColor, sectionOrder, clickToEdit, onEdit } =
    props;
  const spacing = cvSettings.compactMode ? 'space-y-4' : 'space-y-5';

  return (
    <div className={spacing}>
      <EditableRegion
        active={clickToEdit}
        label="Thông tin đầu CV"
        onEdit={() => onEdit('profile')}
      >
        <header className="border-b-2 pb-5 text-center" style={{ borderColor: accentHeadingColor }}>
          {cvSettings.showAvatar && (
            <div className="mb-3 flex justify-center">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={profile.fullName}
                  className="h-18 w-18 rounded-full border border-zinc-200 object-cover"
                />
              ) : (
                <VisualPlaceholder
                  variant="avatar"
                  title={profile.fullName}
                  monogram={profile.monogram}
                  className="h-18 w-18 rounded-full text-lg"
                />
              )}
            </div>
          )}
          <h1 className="font-heading text-2xl font-bold tracking-wide text-zinc-950 uppercase sm:text-3xl">
            {profile.fullName}
          </h1>
          <p className="mt-1 text-sm font-semibold tracking-wider uppercase" style={{ color: accentHeadingColor }}>
            {profile.role}
          </p>
          <div className="mt-2.5">
            <CvContactLinks profile={profile} centered />
          </div>
        </header>
      </EditableRegion>

      <div className={spacing}>
        {sectionOrder.map((key) => {
          const rendered = renderCvSectionContent(key, props);
          if (!rendered) return null;
          return (
            <EditableRegion
              key={key}
              active={clickToEdit}
              label={rendered.title}
              onEdit={() => onEdit(rendered.editSection)}
            >
              <section className="cv-entry grid gap-2 border-b border-zinc-100 pb-4 last:border-b-0 sm:grid-cols-12 print:grid-cols-12">
                <div className="sm:col-span-3 print:col-span-3">
                  <h2
                    className="font-heading text-[11px] font-bold tracking-wider uppercase"
                    style={{ color: accentHeadingColor }}
                  >
                    {rendered.title}
                  </h2>
                </div>
                <div className="sm:col-span-9 print:col-span-9">{rendered.body}</div>
              </section>
            </EditableRegion>
          );
        })}
      </div>
    </div>
  );
}

function ModernSplitCv(props: TemplateProps) {
  const {
    profile,
    avatarSrc,
    cvSettings,
    accentHeadingColor,
    sectionOrder,
    experiences,
    projects,
    achievements,
    education,
    skills,
    clickToEdit,
    onEdit,
  } = props;
  const spacing = cvSettings.compactMode ? 'space-y-4' : 'space-y-5';

  const sidebarKeys = new Set<CvSectionKey>(['skills', 'education', 'achievements']);
  const mainKeys = sectionOrder.filter((k) => !sidebarKeys.has(k));
  const orderedSidebarKeys = sectionOrder.filter((k) => sidebarKeys.has(k));

  return (
    <div className="grid gap-7 md:grid-cols-12 print:grid-cols-12">
      {/* Left Sidebar (34%) */}
      <aside
        className={`border-b border-zinc-200 pb-5 md:col-span-4 md:border-r md:border-b-0 md:pr-5 md:pb-0 print:col-span-4 print:border-r print:border-b-0 print:pr-5 ${spacing}`}
      >
        <EditableRegion
          active={clickToEdit}
          label="Thông tin liên hệ"
          onEdit={() => onEdit('profile')}
        >
          <div className="space-y-3">
            {cvSettings.showAvatar && (
              <div>
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={profile.fullName}
                    className="h-24 w-24 rounded-2xl border border-zinc-200 object-cover"
                  />
                ) : (
                  <VisualPlaceholder
                    variant="avatar"
                    title={profile.fullName}
                    monogram={profile.monogram}
                    className="h-24 w-24 rounded-2xl text-2xl"
                  />
                )}
              </div>
            )}

            <div>
              <h1 className="font-heading text-xl font-bold tracking-tight text-zinc-950">
                {profile.fullName}
              </h1>
              <p className="mt-0.5 text-sm font-semibold" style={{ color: accentHeadingColor }}>
                {profile.role}
              </p>
            </div>

            <div className="cv-entry">
              <CvSectionTitle title="Liên hệ" color={accentHeadingColor} />
              <div className="space-y-1.5 text-xs text-zinc-700">
                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="flex items-center gap-1.5 break-all hover:underline"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                    {profile.email}
                  </a>
                )}
                {profile.phone && (
                  <a
                    href={`tel:${profile.phone.replace(/\s+/g, '')}`}
                    className="flex items-center gap-1.5 hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                    {profile.phone}
                  </a>
                )}
                {profile.location && (
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                    {profile.location}
                  </p>
                )}
                {profile.website && (
                  <a
                    href={normalizeExternalUrl(profile.website)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 break-all hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>
          </div>
        </EditableRegion>

        {orderedSidebarKeys.map((key) => {
          if (key === 'skills' && cvSettings.showSkills && skills.length > 0) {
            return (
              <EditableRegion
                key="skills"
                active={clickToEdit}
                label="Kỹ năng"
                onEdit={() => onEdit('eduSkills')}
              >
                <div className="cv-entry">
                  <CvSectionTitle title="Kỹ năng" color={accentHeadingColor} />
                  <div className="space-y-2.5 text-xs">
                    {skills.map((group) => (
                      <div key={group.id}>
                        <p className="font-semibold text-zinc-900">{group.category}</p>
                        <p className="mt-0.5 leading-relaxed text-zinc-600">
                          {group.skills.join(' • ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </EditableRegion>
            );
          }

          if (key === 'education' && cvSettings.showEducation && education.length > 0) {
            return (
              <EditableRegion
                key="education"
                active={clickToEdit}
                label="Học vấn"
                onEdit={() => onEdit('eduSkills')}
              >
                <div className="cv-entry">
                  <CvSectionTitle title="Học vấn" color={accentHeadingColor} />
                  <div className="space-y-2.5 text-xs">
                    {education.map((edu) => (
                      <div key={edu.id}>
                        <p className="font-semibold text-zinc-900">{edu.degree}</p>
                        <p className="text-zinc-700">{edu.school}</p>
                        <p className="text-zinc-500">{edu.period}</p>
                        {edu.gpaOrHonors && (
                          <p className="mt-0.5 text-zinc-600">{edu.gpaOrHonors}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </EditableRegion>
            );
          }

          if (key === 'achievements' && cvSettings.showAchievements && achievements.length > 0) {
            return (
              <EditableRegion
                key="achievements"
                active={clickToEdit}
                label="Thành tích"
                onEdit={() => onEdit('achievements')}
              >
                <div className="cv-entry">
                  <CvSectionTitle title="Thành tích" color={accentHeadingColor} />
                  <ul className="space-y-2 text-xs text-zinc-700">
                    {achievements.map((ach) => (
                      <li key={ach.id}>
                        <p className="font-semibold text-zinc-900">{ach.cvNote || ach.title}</p>
                        <p className="text-zinc-500">
                          {[ach.issuer, ach.date].filter(Boolean).join(' • ')}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </EditableRegion>
            );
          }

          return null;
        })}
      </aside>

      {/* Main Column (66%) */}
      <div className={`md:col-span-8 print:col-span-8 ${spacing}`}>
        {mainKeys.map((key) => {
          if (key === 'summary') {
            if (!cvSettings.showSummary || !profile.cvSummary) return null;
            return (
              <EditableRegion
                key="summary"
                active={clickToEdit}
                label="Mục tiêu & Tóm tắt"
                onEdit={() => onEdit('profile')}
              >
                <section className="cv-entry">
                  <CvSectionTitle title="Mục tiêu & Tóm tắt" color={accentHeadingColor} />
                  <p className="leading-relaxed text-zinc-700">{profile.cvSummary}</p>
                </section>
              </EditableRegion>
            );
          }

          if (key === 'experience') {
            if (!cvSettings.showExperience || experiences.length === 0) return null;
            return (
              <EditableRegion
                key="experience"
                active={clickToEdit}
                label="Kinh nghiệm làm việc"
                onEdit={() => onEdit('experiences')}
              >
                <section>
                  <CvSectionTitle title="Kinh nghiệm làm việc" color={accentHeadingColor} />
                  <div className="space-y-4">
                    {experiences.map((exp) => {
                      const nonEmptyBullets = exp.bullets.filter((b) => b.trim() !== '');
                      return (
                        <div key={exp.id} className="cv-entry">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h3 className="font-heading font-bold text-zinc-900">{exp.role}</h3>
                            <span className="text-xs font-medium text-zinc-500">{exp.period}</span>
                          </div>
                          <p className="text-xs font-medium text-zinc-600">
                            {exp.organization}
                            {exp.location ? ` • ${exp.location}` : ''}
                          </p>
                          {nonEmptyBullets.length > 0 ? (
                            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-zinc-700">
                              {nonEmptyBullets.map((bullet, idx) => (
                                <li key={idx} className="leading-snug">
                                  {bullet}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            exp.summary && <p className="mt-1 text-zinc-700">{exp.summary}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              </EditableRegion>
            );
          }

          if (key === 'projects') {
            if (!cvSettings.showProjects || projects.length === 0) return null;
            return (
              <EditableRegion
                key="projects"
                active={clickToEdit}
                label="Dự án nổi bật"
                onEdit={() => onEdit('projects')}
              >
                <section>
                  <CvSectionTitle title="Dự án nổi bật" color={accentHeadingColor} />
                  <div className="space-y-3">
                    {projects.map((proj) => (
                      <div key={proj.id} className="cv-entry">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="font-heading font-bold text-zinc-900">{proj.title}</h3>
                          <span className="text-xs font-medium text-zinc-500">{proj.period}</span>
                        </div>
                        <p className="mt-1 leading-snug text-zinc-700">
                          {proj.cvSummary || proj.shortDescription}
                        </p>
                        {proj.tags.length > 0 && (
                          <p className="mt-0.5 text-xs text-zinc-500">{proj.tags.join(' • ')}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </EditableRegion>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
