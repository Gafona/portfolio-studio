import { useEffect, useMemo, useState } from 'react';
import {
  Award,
  Briefcase,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Github,
  MapPin,
  Sparkles,
  X,
} from 'lucide-react';
import type { AchievementItem, ExperienceItem, ProjectItem } from '../types/portfolio';
import { normalizeExternalUrl, resolveAssetUrl } from '../utils/assets';
import { VisualPlaceholder } from './VisualPlaceholder';

export type PortfolioDetailTarget =
  | { kind: 'project'; item: ProjectItem }
  | { kind: 'achievement'; item: AchievementItem }
  | { kind: 'experience'; item: ExperienceItem };

interface PortfolioDetailModalProps {
  target: PortfolioDetailTarget | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  positionLabel?: string;
}

const ACHIEVEMENT_LABEL: Record<AchievementItem['category'], string> = {
  award: 'Giải thưởng',
  certificate: 'Chứng chỉ',
  milestone: 'Dấu mốc',
};

export function PortfolioDetailModal({
  target,
  onClose,
  onPrev,
  onNext,
  positionLabel,
}: PortfolioDetailModalProps) {
  useEffect(() => {
    if (!target) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft' && onPrev) {
        onPrev();
      } else if (event.key === 'ArrowRight' && onNext) {
        onNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [target, onClose, onPrev, onNext]);

  if (!target) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/65 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="surface-card radius-card relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden border border-token shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Controls */}
        <div className="flex items-center justify-between border-b border-token px-5 py-3">
          <div className="flex items-center gap-2">
            {(onPrev || onNext) && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={!onPrev}
                  onClick={onPrev}
                  aria-label="Mục trước"
                  className="surface-subtle inline-flex h-8 w-8 items-center justify-center rounded-lg border border-token ink-secondary transition hover:border-token-strong disabled:opacity-35"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={!onNext}
                  onClick={onNext}
                  aria-label="Mục tiếp theo"
                  className="surface-subtle inline-flex h-8 w-8 items-center justify-center rounded-lg border border-token ink-secondary transition hover:border-token-strong disabled:opacity-35"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
            {positionLabel && (
              <span className="font-mono text-xs ink-muted">{positionLabel}</span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng chi tiết"
            className="surface-subtle inline-flex h-8 w-8 items-center justify-center rounded-full border border-token ink-secondary transition hover:border-token-strong"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto">
          {target.kind === 'project' && (
            <ProjectModalBody key={target.item.id} item={target.item} />
          )}
          {target.kind === 'achievement' && (
            <AchievementModalBody key={target.item.id} item={target.item} />
          )}
          {target.kind === 'experience' && (
            <ExperienceModalBody key={target.item.id} item={target.item} />
          )}
        </div>
      </div>
    </div>
  );
}

function ProjectModalBody({ item }: { item: ProjectItem }) {
  const images = useMemo(() => {
    const raw = [item.thumbnailUrl, ...(item.galleryUrls ?? [])];
    return raw.map((u) => resolveAssetUrl(u)).filter(Boolean);
  }, [item.thumbnailUrl, item.galleryUrls]);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const currentImage = images[activeImageIdx] ?? '';
  const liveHref = normalizeExternalUrl(item.liveUrl);
  const repoHref = normalizeExternalUrl(item.repoUrl);

  return (
    <div>
      <div className="surface-subtle h-60 w-full overflow-hidden sm:h-72">
        {currentImage ? (
          <img
            src={currentImage}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <VisualPlaceholder
            variant="project"
            title={item.title}
            subtitle={item.subtitle}
            period={item.period}
            tags={item.tags}
            className="h-full w-full rounded-none border-0"
          />
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto border-b border-token px-6 py-3">
          {images.map((src, idx) => (
            <button
              key={`${src}-${idx}`}
              type="button"
              onClick={() => setActiveImageIdx(idx)}
              className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                idx === activeImageIdx
                  ? 'border-[var(--accent)] opacity-100'
                  : 'border-transparent opacity-65 hover:opacity-100'
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="space-y-5 p-6 sm:p-7">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs ink-muted">
            <span className="rounded-full border border-accent bg-accent-soft px-2.5 py-0.5 font-medium text-accent">
              {item.category || 'Dự án'}
            </span>
            {item.period && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {item.period}
              </span>
            )}
            {item.role && <span>• {item.role}</span>}
          </div>

          <h3 className="font-heading text-2xl font-bold ink-primary">{item.title}</h3>
          {item.subtitle && (
            <p className="text-sm font-medium ink-secondary">{item.subtitle}</p>
          )}
          <p className="text-sm leading-relaxed ink-secondary">{item.shortDescription}</p>
        </div>

        {(item.caseStudy.problem || item.caseStudy.solution || item.caseStudy.impact) && (
          <div className="surface-subtle radius-card grid gap-3.5 border border-token p-4 sm:p-5">
            {item.caseStudy.problem && (
              <div>
                <h4 className="text-xs font-semibold tracking-wider uppercase ink-muted">
                  Bài toán
                </h4>
                <p className="mt-1 text-sm leading-relaxed ink-secondary">
                  {item.caseStudy.problem}
                </p>
              </div>
            )}
            {item.caseStudy.solution && (
              <div>
                <h4 className="text-xs font-semibold tracking-wider uppercase ink-muted">
                  Giải pháp
                </h4>
                <p className="mt-1 text-sm leading-relaxed ink-secondary">
                  {item.caseStudy.solution}
                </p>
              </div>
            )}
            {item.caseStudy.impact && (
              <div>
                <h4 className="text-xs font-semibold tracking-wider text-accent uppercase">
                  Kết quả đạt được
                </h4>
                <p className="mt-1 text-sm leading-relaxed font-medium ink-primary">
                  {item.caseStudy.impact}
                </p>
              </div>
            )}
          </div>
        )}

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="surface-subtle rounded-lg border border-token px-2.5 py-1 text-xs font-medium ink-secondary"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {(liveHref || repoHref) && (
          <div className="flex flex-wrap gap-3 pt-1">
            {liveHref && (
              <a
                href={liveHref}
                target="_blank"
                rel="noreferrer"
                className="radius-btn inline-flex items-center gap-2 bg-accent px-4 py-2 text-sm font-semibold transition hover:opacity-90"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Xem sản phẩm</span>
              </a>
            )}
            {repoHref && (
              <a
                href={repoHref}
                target="_blank"
                rel="noreferrer"
                className="radius-btn surface-subtle inline-flex items-center gap-2 border border-token px-4 py-2 text-sm font-medium ink-primary transition hover:border-token-strong"
              >
                {repoHref.toLowerCase().includes('github.com') ? (
                  <>
                    <Github className="h-4 w-4" />
                    <span>Mã nguồn</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4" />
                    <span>Tài liệu / Liên kết</span>
                  </>
                )}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AchievementModalBody({ item }: { item: AchievementItem }) {
  const image = resolveAssetUrl(item.imageUrl);
  const credentialHref = normalizeExternalUrl(item.credentialUrl);

  return (
    <div>
      {image ? (
        <div className="surface-subtle max-h-72 w-full overflow-hidden">
          <img src={image} alt={item.title} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="h-44 w-full overflow-hidden">
          <VisualPlaceholder
            variant="achievement"
            title={item.title}
            subtitle={item.issuer}
            period={item.date}
            tags={item.tags}
            className="h-full w-full rounded-none border-0"
          />
        </div>
      )}

      <div className="space-y-4 p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-2 text-xs ink-muted">
          <span className="inline-flex items-center gap-1 rounded-full border border-accent bg-accent-soft px-2.5 py-0.5 font-medium text-accent">
            <Award className="h-3 w-3" />
            {ACHIEVEMENT_LABEL[item.category]}
          </span>
          {item.date && <span>• {item.date}</span>}
          {item.issuer && <span>• {item.issuer}</span>}
        </div>

        <h3 className="font-heading text-2xl font-bold ink-primary">{item.title}</h3>
        <p className="text-sm leading-relaxed ink-secondary">{item.description}</p>

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="surface-subtle rounded-lg border border-token px-2.5 py-1 text-xs font-medium ink-secondary"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {credentialHref && (
          <div className="pt-2">
            <a
              href={credentialHref}
              target="_blank"
              rel="noreferrer"
              className="radius-btn inline-flex items-center gap-2 bg-accent px-4 py-2 text-sm font-semibold transition hover:opacity-90"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Xem minh chứng / chứng nhận</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function ExperienceModalBody({ item }: { item: ExperienceItem }) {
  const nonEmptyBullets = item.bullets.filter((b) => b.trim() !== '');

  return (
    <div className="space-y-5 p-6 sm:p-7">
      <div className="flex flex-wrap items-center gap-2 text-xs ink-muted">
        <span className="inline-flex items-center gap-1 rounded-full border border-accent bg-accent-soft px-2.5 py-0.5 font-medium text-accent">
          <Briefcase className="h-3 w-3" />
          {item.type || 'Kinh nghiệm'}
        </span>
        {item.period && <span>• {item.period}</span>}
        {item.location && (
          <span className="inline-flex items-center gap-1">
            • <MapPin className="h-3 w-3" />
            {item.location}
          </span>
        )}
      </div>

      <div>
        <h3 className="font-heading text-2xl font-bold ink-primary">{item.role}</h3>
        <p className="mt-1 text-sm font-medium ink-secondary">{item.organization}</p>
      </div>

      {item.summary && (
        <p className="text-sm leading-relaxed ink-secondary">{item.summary}</p>
      )}

      {nonEmptyBullets.length > 0 && (
        <div className="surface-subtle radius-card border border-token p-4">
          <h4 className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase ink-muted">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Điểm nổi bật &amp; Đóng góp
          </h4>
          <ul className="space-y-2 text-sm ink-secondary">
            {nonEmptyBullets.map((bullet, idx) => (
              <li key={idx} className="flex gap-2.5 leading-relaxed">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="surface-subtle rounded-lg border border-token px-2.5 py-1 text-xs font-medium ink-secondary"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
