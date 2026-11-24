import { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Copy,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import type {
  AchievementCategory,
  AchievementItem,
  EditFocusTarget,
  EducationItem,
  ExperienceItem,
  PortfolioData,
  ProjectItem,
  SkillGroup,
  SocialPlatform,
} from '../types/portfolio';
import { createId, moveItem } from '../utils/assets';
import { ImageUploader } from './ImageUploader';

export type ContentEditorSection =
  | 'profile'
  | 'experiences'
  | 'projects'
  | 'achievements'
  | 'eduSkills';

interface ContentEditorProps {
  activeSection: ContentEditorSection;
  data: PortfolioData;
  canSaveLocally: boolean;
  focusTarget?: EditFocusTarget | null;
  onChange: (updater: (prev: PortfolioData) => PortfolioData) => void;
  onUndo: () => void;
  onNotify?: (
    type: 'success' | 'error' | 'info',
    text: string,
    action?: { label: string; onClick: () => void },
  ) => void;
}

type VisibilityFilter = 'all' | 'portfolio' | 'cv';

const inputClass =
  'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-blue-500';
const labelClass = 'block text-xs font-semibold text-zinc-700';

function countWords(text: string): number {
  const cleaned = text.trim();
  return cleaned ? cleaned.split(/\s+/).length : 0;
}

function FieldCounter({
  value,
  idealMin,
  idealMax,
  hint,
}: {
  value: string;
  idealMin: number;
  idealMax: number;
  hint: string;
}) {
  const words = countWords(value);
  const inRange = words >= idealMin && words <= idealMax;
  const overMax = words > idealMax;
  const toneClass =
    words === 0
      ? 'text-zinc-400'
      : overMax
        ? 'text-amber-600'
        : inRange
          ? 'text-emerald-600'
          : 'text-zinc-500';
  const statusText =
    words === 0
      ? 'Chưa nhập'
      : words < idealMin
        ? 'Hơi ngắn'
        : overMax
          ? 'Hơi dài'
          : 'Độ dài đẹp';

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-[11px]">
      <span className="text-zinc-500">{hint}</span>
      <span className={`font-medium tabular-nums ${toneClass}`}>
        {words} chữ · Nên {idealMin}–{idealMax} ({statusText})
      </span>
    </div>
  );
}

export function ContentEditor({
  activeSection,
  data,
  canSaveLocally,
  focusTarget,
  onChange,
  onUndo,
  onNotify,
}: ContentEditorProps) {
  return (
    <div className="space-y-4">
      {activeSection === 'profile' && (
        <ProfileEditor
          data={data}
          canSaveLocally={canSaveLocally}
          onChange={onChange}
          onNotify={onNotify}
        />
      )}
      {activeSection === 'experiences' && (
        <ExperienceListEditor
          data={data}
          focusTarget={focusTarget}
          onChange={onChange}
          onUndo={onUndo}
          onNotify={onNotify}
        />
      )}
      {activeSection === 'projects' && (
        <ProjectListEditor
          data={data}
          canSaveLocally={canSaveLocally}
          focusTarget={focusTarget}
          onChange={onChange}
          onUndo={onUndo}
          onNotify={onNotify}
        />
      )}
      {activeSection === 'achievements' && (
        <AchievementListEditor
          data={data}
          canSaveLocally={canSaveLocally}
          focusTarget={focusTarget}
          onChange={onChange}
          onUndo={onUndo}
          onNotify={onNotify}
        />
      )}
      {activeSection === 'eduSkills' && (
        <EducationSkillsEditor data={data} onChange={onChange} />
      )}
    </div>
  );
}

function TogglePill({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 select-none hover:bg-zinc-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 rounded accent-blue-600"
      />
      <span>{label}</span>
    </label>
  );
}

function VisibilityFilterBar({
  value,
  onChange,
}: {
  value: VisibilityFilter;
  onChange: (next: VisibilityFilter) => void;
}) {
  const options: Array<{ id: VisibilityFilter; label: string }> = [
    { id: 'all', label: 'Tất cả' },
    { id: 'portfolio', label: 'Trên Portfolio' },
    { id: 'cv', label: 'Trên CV' },
  ];
  return (
    <div className="inline-flex rounded-lg border border-zinc-200 bg-white p-0.5">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
            value === opt.id
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function TagsInput({
  label,
  tags,
  onChange,
}: {
  label: string;
  tags: string[];
  onChange: (nextTags: string[]) => void;
}) {
  const [draft, setDraft] = useState('');

  const commitDraft = (raw: string) => {
    const incoming = raw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (incoming.length === 0) {
      setDraft('');
      return;
    }

    const seen = new Set(tags.map((t) => t.toLowerCase()));
    const next = [...tags];
    for (const item of incoming) {
      const key = item.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        next.push(item);
      }
    }
    onChange(next);
    setDraft('');
  };

  const removeTagAt = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitDraft(draft);
      return;
    }
    if (e.key === 'Backspace' && draft === '' && tags.length > 0) {
      e.preventDefault();
      removeTagAt(tags.length - 1);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className={labelClass}>{label} (nhấn Enter hoặc dấu phẩy để thêm)</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => {
            const val = e.target.value;
            if (val.includes(',')) {
              commitDraft(val);
            } else {
              setDraft(val);
            }
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (draft.trim()) commitDraft(draft);
          }}
          placeholder="Nhập thẻ rồi nhấn Enter (VD: React, TypeScript)"
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => commitDraft(draft)}
          className="shrink-0 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100"
        >
          Thêm
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {tags.map((tag, i) => (
            <span
              key={`${tag}-${i}`}
              className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-100/90 px-2 py-0.5 text-[11px] font-medium text-zinc-700"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTagAt(i)}
                aria-label={`Xóa thẻ ${tag}`}
                className="rounded p-0.5 text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function BulletListEditor({
  label,
  bullets,
  onChange,
}: {
  label: string;
  bullets: string[];
  onChange: (nextBullets: string[]) => void;
}) {
  const handleAddAfter = (index?: number) => {
    const next = [...bullets];
    if (typeof index === 'number') {
      next.splice(index + 1, 0, '');
    } else {
      next.push('');
    }
    onChange(next);
  };

  const handleUpdateAt = (index: number, value: string) => {
    const next = [...bullets];
    next[index] = value;
    onChange(next);
  };

  const handleRemoveAt = (index: number) => {
    onChange(bullets.filter((_, i) => i !== index));
  };

  const handlePaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    if (!text.includes('\n')) return;
    e.preventDefault();
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.replace(/^\s*[•\-*]\s*/, '').trim())
      .filter(Boolean);
    if (lines.length === 0) return;
    const next = [...bullets];
    next.splice(index, 1, ...lines);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className={labelClass}>{label}</label>
        <button
          type="button"
          onClick={() => handleAddAfter()}
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100"
        >
          <Plus className="h-3.5 w-3.5" />
          Thêm dòng
        </button>
      </div>

      {bullets.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-200 px-3 py-2 text-xs text-zinc-500">
          Chưa có gạch đầu dòng nào. Nhấn &quot;Thêm dòng&quot; để bổ sung kết quả công việc.
        </p>
      ) : (
        <div className="space-y-1.5">
          {bullets.map((bullet, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-sm font-bold text-zinc-400 select-none">•</span>
              <input
                type="text"
                value={bullet}
                onChange={(e) => handleUpdateAt(idx, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAfter(idx);
                  }
                }}
                onPaste={(e) => handlePaste(idx, e)}
                placeholder="Nhập kết quả (nhấn Enter để thêm dòng mới)..."
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => handleRemoveAt(idx)}
                className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50"
                aria-label={`Xóa dòng ${idx + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileEditor({
  data,
  canSaveLocally,
  onChange,
  onNotify,
}: {
  data: PortfolioData;
  canSaveLocally: boolean;
  onChange: (updater: (prev: PortfolioData) => PortfolioData) => void;
  onNotify?: ContentEditorProps['onNotify'];
}) {
  const { profile } = data;

  const updateProfile = <K extends keyof PortfolioData['profile']>(
    key: K,
    value: PortfolioData['profile'][K],
  ) => {
    onChange((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [key]: value,
      },
    }));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
        <h3 className="font-heading text-sm font-bold text-zinc-900">Thông tin cơ bản</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className={labelClass}>Họ và tên</label>
            <input
              type="text"
              value={profile.fullName}
              onChange={(e) => updateProfile('fullName', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Chữ viết tắt (Monogram)</label>
            <input
              type="text"
              maxLength={4}
              value={profile.monogram}
              onChange={(e) => updateProfile('monogram', e.target.value)}
              placeholder="MA"
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className={labelClass}>Chức danh / Vai trò chính</label>
          <input
            type="text"
            value={profile.role}
            onChange={(e) => updateProfile('role', e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="space-y-1">
          <label className={labelClass}>Tagline nổi bật ở Hero</label>
          <textarea
            rows={2}
            value={profile.tagline}
            onChange={(e) => updateProfile('tagline', e.target.value)}
            className={inputClass}
          />
          <FieldCounter
            value={profile.tagline}
            idealMin={12}
            idealMax={30}
            hint="1–2 câu súc tích tạo ấn tượng đầu ở Hero."
          />
        </div>

        <ImageUploader
          label="Ảnh đại diện (Avatar)"
          value={profile.avatarUrl}
          canSaveLocally={canSaveLocally}
          onChange={(url) => updateProfile('avatarUrl', url)}
          onNotify={onNotify}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => updateProfile('email', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Số điện thoại (trên CV)</label>
            <input
              type="text"
              value={profile.phone}
              onChange={(e) => updateProfile('phone', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Địa điểm</label>
            <input
              type="text"
              value={profile.location}
              onChange={(e) => updateProfile('location', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Website cá nhân</label>
            <input
              type="text"
              value={profile.website}
              onChange={(e) => updateProfile('website', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50/70 p-3">
          <div className="flex items-center justify-between gap-2">
            <label className={labelClass}>Trạng thái sẵn sàng (Badge ở Hero)</label>
            <TogglePill
              checked={profile.showAvailability}
              label="Hiển thị"
              onChange={(next) => updateProfile('showAvailability', next)}
            />
          </div>
          <input
            type="text"
            value={profile.availability}
            onChange={(e) => updateProfile('availability', e.target.value)}
            placeholder="VD: Sẵn sàng trao đổi cơ hội hợp tác mới..."
            className={inputClass}
          />
          <p className="text-[11px] text-zinc-500">
            Tùy chọn bật/tắt; dùng được cho mọi ngành nghề hoặc tắt đi nếu muốn Hero tối giản.
          </p>
        </div>
      </div>

      {/* Separated About Story vs CV Summary */}
      <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
        <h3 className="font-heading text-sm font-bold text-zinc-900">
          Nội dung giới thiệu (Tách riêng Web &amp; CV)
        </h3>
        <div className="space-y-1">
          <label className={labelClass}>
            Giới thiệu gần gũi (Trang Giới thiệu — tách đoạn bằng dòng trống)
          </label>
          <textarea
            rows={5}
            value={profile.aboutStory}
            onChange={(e) => updateProfile('aboutStory', e.target.value)}
            className={inputClass}
          />
          <FieldCounter
            value={profile.aboutStory}
            idealMin={60}
            idealMax={140}
            hint="2–3 đoạn tự sự gần gũi về hành trình & định hướng."
          />
        </div>
        <div className="space-y-1">
          <label className={labelClass}>
            Tóm tắt chuyên môn ngắn (Hiển thị trên tờ CV A4)
          </label>
          <textarea
            rows={3}
            value={profile.cvSummary}
            onChange={(e) => updateProfile('cvSummary', e.target.value)}
            className={inputClass}
          />
          <FieldCounter
            value={profile.cvSummary}
            idealMin={25}
            idealMax={60}
            hint="Gọn trong 3–4 dòng đầu tờ CV chuẩn A4."
          />
        </div>
      </div>

      {/* Highlights */}
      <div className="space-y-2.5 rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className={labelClass}>Các con số nổi bật (Trang Giới thiệu)</span>
            <p className="mt-0.5 text-[11px] text-zinc-500">
              Đang có {profile.highlights.length}/4 chỉ số · Nên dùng 2–3 chỉ số (lưới tự chia đều).
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                const projCount =
                  data.projects.filter((p) => p.showInPortfolio).length || data.projects.length;
                const years: number[] = [];
                let hasPresent = false;
                data.experiences.forEach((exp) => {
                  const lower = exp.period.toLowerCase();
                  if (lower.includes('hiện tại') || lower.includes('present')) {
                    hasPresent = true;
                  }
                  const matches = exp.period.match(/(?:19|20)\d{2}/g);
                  if (matches) {
                    matches.forEach((m) => years.push(Number.parseInt(m, 10)));
                  }
                });
                const nowYear = new Date().getFullYear();
                const expYears =
                  years.length > 0
                    ? Math.max(
                        1,
                        (hasPresent ? nowYear : Math.max(...years)) - Math.min(...years) + 1,
                      )
                    : Math.max(1, data.experiences.length);
                const achCount =
                  data.achievements.filter((a) => a.showInPortfolio).length ||
                  data.achievements.length;
                const skillTotal = data.skills.reduce((sum, g) => sum + g.skills.length, 0);

                const computed = [
                  {
                    id: profile.highlights[0]?.id || createId('hl'),
                    value: `${expYears}+ năm`,
                    label: 'Kinh nghiệm thực chiến',
                  },
                  {
                    id: profile.highlights[1]?.id || createId('hl'),
                    value: `${String(projCount).padStart(2, '0')}+`,
                    label: 'Dự án đã thực hiện',
                  },
                  achCount > 0
                    ? {
                        id: profile.highlights[2]?.id || createId('hl'),
                        value: `${String(achCount).padStart(2, '0')}`,
                        label: 'Giải thưởng & Chứng nhận',
                      }
                    : {
                        id: profile.highlights[2]?.id || createId('hl'),
                        value: `${skillTotal}+`,
                        label: 'Kỹ năng & Công cụ',
                      },
                ];
                updateProfile('highlights', computed);
                onNotify?.('success', 'Đã tự tính 3 chỉ số nổi bật từ dữ liệu hồ sơ');
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
              title="Tự động tổng hợp số năm, dự án và thành tích từ hồ sơ hiện tại"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Tự tính từ hồ sơ
            </button>
            <button
              type="button"
              onClick={() =>
                updateProfile('highlights', [
                  ...profile.highlights,
                  { id: createId('hl'), label: 'Chỉ số mới', value: '10+' },
                ])
              }
              className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-zinc-800"
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {profile.highlights.map((hl, idx) => (
            <div key={hl.id} className="flex items-center gap-2">
              <input
                type="text"
                value={hl.value}
                onChange={(e) => {
                  const next = [...profile.highlights];
                  next[idx] = { ...hl, value: e.target.value };
                  updateProfile('highlights', next);
                }}
                placeholder="3+ năm"
                className={`${inputClass} w-28 shrink-0`}
              />
              <input
                type="text"
                value={hl.label}
                onChange={(e) => {
                  const next = [...profile.highlights];
                  next[idx] = { ...hl, label: e.target.value };
                  updateProfile('highlights', next);
                }}
                placeholder="Kinh nghiệm..."
                className={inputClass}
              />
              <button
                type="button"
                onClick={() =>
                  updateProfile(
                    'highlights',
                    profile.highlights.filter((item) => item.id !== hl.id),
                  )
                }
                className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                aria-label="Xóa chỉ số"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-2.5 rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <span className={labelClass}>Liên kết mạng xã hội</span>
          <button
            type="button"
            onClick={() =>
              updateProfile('socials', [
                ...profile.socials,
                { id: createId('soc'), label: 'LinkedIn', url: 'https://', platform: 'linkedin' },
              ])
            }
            className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm
          </button>
        </div>

        <div className="space-y-2">
          {profile.socials.map((soc, idx) => (
            <div key={soc.id} className="grid grid-cols-12 items-center gap-2">
              <select
                value={soc.platform}
                onChange={(e) => {
                  const next = [...profile.socials];
                  next[idx] = { ...soc, platform: e.target.value as SocialPlatform };
                  updateProfile('socials', next);
                }}
                className={`${inputClass} col-span-4`}
              >
                <option value="github">GitHub</option>
                <option value="linkedin">LinkedIn</option>
                <option value="website">Website</option>
                <option value="behance">Behance</option>
                <option value="dribbble">Dribbble</option>
                <option value="facebook">Facebook</option>
                <option value="x">X</option>
                <option value="other">Khác</option>
              </select>
              <input
                type="text"
                value={soc.label}
                onChange={(e) => {
                  const next = [...profile.socials];
                  next[idx] = { ...soc, label: e.target.value };
                  updateProfile('socials', next);
                }}
                placeholder="Tên"
                className={`${inputClass} col-span-3`}
              />
              <input
                type="text"
                value={soc.url}
                onChange={(e) => {
                  const next = [...profile.socials];
                  next[idx] = { ...soc, url: e.target.value };
                  updateProfile('socials', next);
                }}
                placeholder="https://..."
                className={`${inputClass} col-span-4`}
              />
              <button
                type="button"
                onClick={() =>
                  updateProfile(
                    'socials',
                    profile.socials.filter((item) => item.id !== soc.id),
                  )
                }
                className="col-span-1 flex justify-center rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                aria-label="Xóa liên kết"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExperienceListEditor({
  data,
  focusTarget,
  onChange,
  onUndo,
  onNotify,
}: {
  data: PortfolioData;
  focusTarget?: EditFocusTarget | null;
  onChange: (updater: (prev: PortfolioData) => PortfolioData) => void;
  onUndo: () => void;
  onNotify?: ContentEditorProps['onNotify'];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(
    data.experiences[0]?.id ?? null,
  );
  const [filter, setFilter] = useState<VisibilityFilter>('all');
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (focusTarget?.section === 'experiences' && focusTarget.itemId) {
      setFilter('all');
      setExpandedId(focusTarget.itemId);
      const targetId = focusTarget.itemId;
      window.setTimeout(() => {
        cardRefs.current[targetId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 60);
    }
  }, [focusTarget]);

  const updateExperience = (id: string, patch: Partial<ExperienceItem>) => {
    onChange((prev) => ({
      ...prev,
      experiences: prev.experiences.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    }));
  };

  const handleAdd = () => {
    const nextItem: ExperienceItem = {
      id: createId('exp'),
      role: 'Vị trí công việc mới',
      organization: 'Tên công ty / tổ chức',
      location: 'TP. Hồ Chí Minh',
      period: '2026 – Hiện tại',
      type: 'Toàn thời gian',
      summary: 'Mô tả ngắn vai trò và phạm vi phụ trách của bạn.',
      bullets: ['Kết quả hoặc đóng góp nổi bật thứ nhất.'],
      tags: ['Kỹ năng'],
      showInPortfolio: true,
      showInCV: true,
    };
    setFilter('all');
    onChange((prev) => ({ ...prev, experiences: [nextItem, ...prev.experiences] }));
    setExpandedId(nextItem.id);
  };

  const handleDuplicate = (exp: ExperienceItem) => {
    const copy: ExperienceItem = {
      ...exp,
      id: createId('exp'),
      role: `${exp.role} (Bản sao)`,
      bullets: [...exp.bullets],
      tags: [...exp.tags],
    };
    onChange((prev) => ({ ...prev, experiences: [copy, ...prev.experiences] }));
    setExpandedId(copy.id);
    onNotify?.('info', 'Đã nhân bản công việc.');
  };

  const handleDelete = (exp: ExperienceItem) => {
    onChange((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((item) => item.id !== exp.id),
    }));
    onNotify?.('info', `Đã xóa "${exp.role}".`, {
      label: 'Hoàn tác',
      onClick: onUndo,
    });
  };

  const visibleList = data.experiences.filter((exp) => {
    if (filter === 'portfolio') return exp.showInPortfolio;
    if (filter === 'cv') return exp.showInCV;
    return true;
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <VisibilityFilterBar value={filter} onChange={setFilter} />
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold transition hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" />
          Thêm công việc
        </button>
      </div>

      {visibleList.map((exp) => {
        const realIdx = data.experiences.findIndex((x) => x.id === exp.id);
        const isOpen = expandedId === exp.id;
        const isFocused = focusTarget?.itemId === exp.id;

        return (
          <div
            key={exp.id}
            ref={(el) => {
              cardRefs.current[exp.id] = el;
            }}
            className={`group/card rounded-xl border bg-white transition ${
              isFocused ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-zinc-200'
            }`}
          >
            <div className="flex items-center justify-between gap-2 p-3">
              <button
                type="button"
                onClick={() => setExpandedId(isOpen ? null : exp.id)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-zinc-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {exp.role || 'Chưa đặt tên'}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {exp.organization} • {exp.period}
                  </p>
                </div>
              </button>

              <div className="flex items-center gap-0.5 opacity-45 transition group-hover/card:opacity-100">
                <button
                  type="button"
                  onClick={() => handleDuplicate(exp)}
                  className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                  title="Nhân bản"
                  aria-label="Nhân bản công việc"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={realIdx <= 0}
                  onClick={() =>
                    onChange((prev) => ({
                      ...prev,
                      experiences: moveItem(prev.experiences, realIdx, -1),
                    }))
                  }
                  className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 disabled:opacity-30"
                  aria-label="Đưa lên"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={realIdx >= data.experiences.length - 1}
                  onClick={() =>
                    onChange((prev) => ({
                      ...prev,
                      experiences: moveItem(prev.experiences, realIdx, 1),
                    }))
                  }
                  className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 disabled:opacity-30"
                  aria-label="Đưa xuống"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(exp)}
                  className="rounded p-1.5 text-rose-500 hover:bg-rose-50"
                  aria-label="Xóa công việc"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-zinc-100 px-3 py-2">
              <TogglePill
                checked={exp.showInPortfolio}
                label="Hiện ở Portfolio"
                onChange={(next) => updateExperience(exp.id, { showInPortfolio: next })}
              />
              <TogglePill
                checked={exp.showInCV}
                label="Hiện ở CV"
                onChange={(next) => updateExperience(exp.id, { showInCV: next })}
              />
            </div>

            {isOpen && (
              <div className="space-y-3 border-t border-zinc-100 p-3.5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className={labelClass}>Chức danh / Vai trò</label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Công ty / Tổ chức</label>
                    <input
                      type="text"
                      value={exp.organization}
                      onChange={(e) =>
                        updateExperience(exp.id, { organization: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Thời gian</label>
                    <input
                      type="text"
                      value={exp.period}
                      onChange={(e) => updateExperience(exp.id, { period: e.target.value })}
                      placeholder="03/2024 – Hiện tại"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Địa điểm</label>
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>
                    Loại hình (VD: Toàn thời gian, Part-time, CLB)
                  </label>
                  <input
                    type="text"
                    value={exp.type}
                    onChange={(e) => updateExperience(exp.id, { type: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Tóm tắt ngắn (cho Portfolio &amp; Trang chủ)</label>
                  <textarea
                    rows={2}
                    value={exp.summary}
                    onChange={(e) => updateExperience(exp.id, { summary: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <BulletListEditor
                  label="Các gạch đầu dòng kết quả trên CV"
                  bullets={exp.bullets}
                  onChange={(nextBullets) =>
                    updateExperience(exp.id, { bullets: nextBullets })
                  }
                />

                <TagsInput
                  label="Thẻ kỹ năng liên quan"
                  tags={exp.tags}
                  onChange={(nextTags) => updateExperience(exp.id, { tags: nextTags })}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProjectListEditor({
  data,
  canSaveLocally,
  focusTarget,
  onChange,
  onUndo,
  onNotify,
}: {
  data: PortfolioData;
  canSaveLocally: boolean;
  focusTarget?: EditFocusTarget | null;
  onChange: (updater: (prev: PortfolioData) => PortfolioData) => void;
  onUndo: () => void;
  onNotify?: ContentEditorProps['onNotify'];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(data.projects[0]?.id ?? null);
  const [filter, setFilter] = useState<VisibilityFilter>('all');
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (focusTarget?.section === 'projects' && focusTarget.itemId) {
      setFilter('all');
      setExpandedId(focusTarget.itemId);
      const targetId = focusTarget.itemId;
      window.setTimeout(() => {
        cardRefs.current[targetId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 60);
    }
  }, [focusTarget]);

  const updateProject = (id: string, patch: Partial<ProjectItem>) => {
    onChange((prev) => ({
      ...prev,
      projects: prev.projects.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  };

  const handleAdd = () => {
    const nextItem: ProjectItem = {
      id: createId('proj'),
      title: 'Tên dự án mới',
      subtitle: 'Mô tả 1 dòng về dự án',
      category: 'Dự án chuyên môn',
      period: String(new Date().getFullYear()),
      role: 'Tác giả',
      thumbnailUrl: '',
      galleryUrls: [],
      shortDescription: 'Giới thiệu ngắn gọn mục tiêu và giá trị của dự án trên Portfolio.',
      cvSummary: 'Mô tả súc tích 1–2 dòng để hiển thị gọn trên tờ CV A4.',
      caseStudy: {
        problem: '',
        solution: '',
        impact: '',
      },
      tags: ['Kỹ năng 1', 'Kỹ năng 2'],
      liveUrl: '',
      repoUrl: '',
      featured: false,
      showInPortfolio: true,
      showInCV: true,
    };
    setFilter('all');
    onChange((prev) => ({ ...prev, projects: [nextItem, ...prev.projects] }));
    setExpandedId(nextItem.id);
  };

  const handleDuplicate = (proj: ProjectItem) => {
    const copy: ProjectItem = {
      ...proj,
      id: createId('proj'),
      title: `${proj.title} (Bản sao)`,
      galleryUrls: [...(proj.galleryUrls ?? [])],
      tags: [...proj.tags],
      caseStudy: { ...proj.caseStudy },
    };
    onChange((prev) => ({ ...prev, projects: [copy, ...prev.projects] }));
    setExpandedId(copy.id);
    onNotify?.('info', 'Đã nhân bản dự án.');
  };

  const handleDelete = (proj: ProjectItem) => {
    onChange((prev) => ({
      ...prev,
      projects: prev.projects.filter((item) => item.id !== proj.id),
    }));
    onNotify?.('info', `Đã xóa "${proj.title}".`, {
      label: 'Hoàn tác',
      onClick: onUndo,
    });
  };

  const visibleList = data.projects.filter((proj) => {
    if (filter === 'portfolio') return proj.showInPortfolio;
    if (filter === 'cv') return proj.showInCV;
    return true;
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <VisibilityFilterBar value={filter} onChange={setFilter} />
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold transition hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" />
          Thêm dự án
        </button>
      </div>

      {visibleList.map((proj) => {
        const realIdx = data.projects.findIndex((x) => x.id === proj.id);
        const isOpen = expandedId === proj.id;
        const isFocused = focusTarget?.itemId === proj.id;
        const gallery = proj.galleryUrls ?? [];

        return (
          <div
            key={proj.id}
            ref={(el) => {
              cardRefs.current[proj.id] = el;
            }}
            className={`group/card rounded-xl border bg-white transition ${
              isFocused ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-zinc-200'
            }`}
          >
            <div className="flex items-center justify-between gap-2 p-3">
              <button
                type="button"
                onClick={() => setExpandedId(isOpen ? null : proj.id)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-zinc-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {proj.title || 'Dự án mới'}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {proj.category || proj.role} • {proj.period}
                  </p>
                </div>
              </button>

              <div className="flex items-center gap-0.5 opacity-45 transition group-hover/card:opacity-100">
                <button
                  type="button"
                  onClick={() => handleDuplicate(proj)}
                  className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                  title="Nhân bản"
                  aria-label="Nhân bản dự án"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={realIdx <= 0}
                  onClick={() =>
                    onChange((prev) => ({
                      ...prev,
                      projects: moveItem(prev.projects, realIdx, -1),
                    }))
                  }
                  className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 disabled:opacity-30"
                  aria-label="Đưa lên"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={realIdx >= data.projects.length - 1}
                  onClick={() =>
                    onChange((prev) => ({
                      ...prev,
                      projects: moveItem(prev.projects, realIdx, 1),
                    }))
                  }
                  className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 disabled:opacity-30"
                  aria-label="Đưa xuống"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(proj)}
                  className="rounded p-1.5 text-rose-500 hover:bg-rose-50"
                  aria-label="Xóa dự án"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-zinc-100 px-3 py-2">
              <TogglePill
                checked={proj.showInPortfolio}
                label="Hiện ở Portfolio"
                onChange={(next) => updateProject(proj.id, { showInPortfolio: next })}
              />
              <TogglePill
                checked={proj.showInCV}
                label="Hiện ở CV"
                onChange={(next) => updateProject(proj.id, { showInCV: next })}
              />
              <TogglePill
                checked={proj.featured}
                label="Nổi bật"
                onChange={(next) => updateProject(proj.id, { featured: next })}
              />
            </div>

            {isOpen && (
              <div className="space-y-3 border-t border-zinc-100 p-3.5">
                <div className="space-y-1">
                  <label className={labelClass}>Tên dự án</label>
                  <input
                    type="text"
                    value={proj.title}
                    onChange={(e) => updateProject(proj.id, { title: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Mô tả phụ (Subtitle)</label>
                  <input
                    type="text"
                    value={proj.subtitle}
                    onChange={(e) => updateProject(proj.id, { subtitle: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <label className={labelClass}>Phân loại</label>
                    <input
                      type="text"
                      value={proj.category}
                      onChange={(e) => updateProject(proj.id, { category: e.target.value })}
                      placeholder="VD: Chiến dịch, Nghiên cứu, Sản phẩm, Thiết kế..."
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Vai trò</label>
                    <input
                      type="text"
                      value={proj.role}
                      onChange={(e) => updateProject(proj.id, { role: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Thời gian</label>
                    <input
                      type="text"
                      value={proj.period}
                      onChange={(e) => updateProject(proj.id, { period: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                <ImageUploader
                  label="Ảnh đại diện dự án (Cover)"
                  value={proj.thumbnailUrl}
                  canSaveLocally={canSaveLocally}
                  onChange={(url) => updateProject(proj.id, { thumbnailUrl: url })}
                  onNotify={onNotify}
                />

                {/* Extra Gallery Images */}
                <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50/70 p-3">
                  <div className="flex items-center justify-between">
                    <span className={labelClass}>
                      Ảnh bổ sung (Gallery khi bấm xem chi tiết — {gallery.length})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateProject(proj.id, { galleryUrls: [...gallery, ''] })
                      }
                      className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-100"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Thêm ảnh
                    </button>
                  </div>

                  {gallery.map((gUrl, gIdx) => (
                    <div key={gIdx} className="space-y-1 rounded-lg bg-white p-2.5 ring-1 ring-zinc-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-zinc-500">
                          Ảnh #{gIdx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateProject(proj.id, {
                              galleryUrls: gallery.filter((_, i) => i !== gIdx),
                            })
                          }
                          className="text-xs text-rose-600 hover:underline"
                        >
                          Bỏ ảnh này
                        </button>
                      </div>
                      <ImageUploader
                        label=""
                        value={gUrl}
                        canSaveLocally={canSaveLocally}
                        onChange={(nextUrl) => {
                          const nextGallery = [...gallery];
                          nextGallery[gIdx] = nextUrl;
                          updateProject(proj.id, { galleryUrls: nextGallery });
                        }}
                        onNotify={onNotify}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Mô tả chi tiết trên Portfolio</label>
                  <textarea
                    rows={3}
                    value={proj.shortDescription}
                    onChange={(e) =>
                      updateProject(proj.id, { shortDescription: e.target.value })
                    }
                    className={inputClass}
                  />
                  <FieldCounter
                    value={proj.shortDescription}
                    idealMin={18}
                    idealMax={45}
                    hint="Tối ưu để gói gọn trong 2–3 dòng trên thẻ Timeline."
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Bản rút gọn 1–2 dòng trên CV</label>
                  <textarea
                    rows={2}
                    value={proj.cvSummary}
                    onChange={(e) => updateProject(proj.id, { cvSummary: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50/70 p-3">
                  <p className={labelClass}>Case study khi bấm xem chi tiết</p>
                  <input
                    type="text"
                    value={proj.caseStudy.problem}
                    onChange={(e) =>
                      updateProject(proj.id, {
                        caseStudy: { ...proj.caseStudy, problem: e.target.value },
                      })
                    }
                    placeholder="Bài toán đặt ra..."
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={proj.caseStudy.solution}
                    onChange={(e) =>
                      updateProject(proj.id, {
                        caseStudy: { ...proj.caseStudy, solution: e.target.value },
                      })
                    }
                    placeholder="Giải pháp thực hiện..."
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={proj.caseStudy.impact}
                    onChange={(e) =>
                      updateProject(proj.id, {
                        caseStudy: { ...proj.caseStudy, impact: e.target.value },
                      })
                    }
                    placeholder="Kết quả / Giá trị đạt được..."
                    className={inputClass}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className={labelClass}>Link sản phẩm / Bài viết</label>
                    <input
                      type="text"
                      value={proj.liveUrl}
                      onChange={(e) => updateProject(proj.id, { liveUrl: e.target.value })}
                      placeholder="https://..."
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Link tài liệu / Đính kèm (hoặc GitHub)</label>
                    <input
                      type="text"
                      value={proj.repoUrl}
                      onChange={(e) => updateProject(proj.id, { repoUrl: e.target.value })}
                      placeholder="https://..."
                      className={inputClass}
                    />
                  </div>
                </div>

                <TagsInput
                  label="Từ khóa / Kỹ năng áp dụng"
                  tags={proj.tags}
                  onChange={(nextTags) => updateProject(proj.id, { tags: nextTags })}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AchievementListEditor({
  data,
  canSaveLocally,
  focusTarget,
  onChange,
  onUndo,
  onNotify,
}: {
  data: PortfolioData;
  canSaveLocally: boolean;
  focusTarget?: EditFocusTarget | null;
  onChange: (updater: (prev: PortfolioData) => PortfolioData) => void;
  onUndo: () => void;
  onNotify?: ContentEditorProps['onNotify'];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(
    data.achievements[0]?.id ?? null,
  );
  const [filter, setFilter] = useState<VisibilityFilter>('all');
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (focusTarget?.section === 'achievements' && focusTarget.itemId) {
      setFilter('all');
      setExpandedId(focusTarget.itemId);
      const targetId = focusTarget.itemId;
      window.setTimeout(() => {
        cardRefs.current[targetId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 60);
    }
  }, [focusTarget]);

  const updateAchievement = (id: string, patch: Partial<AchievementItem>) => {
    onChange((prev) => ({
      ...prev,
      achievements: prev.achievements.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    }));
  };

  const handleAdd = () => {
    const nextItem: AchievementItem = {
      id: createId('ach'),
      title: 'Thành tích / Chứng chỉ mới',
      issuer: 'Đơn vị cấp / Tổ chức',
      date: '2026',
      category: 'award',
      description: 'Mô tả câu chuyện hoặc giá trị của thành tích này.',
      cvNote: 'Tên thành tích gọn 1 dòng cho CV',
      imageUrl: '',
      credentialUrl: '',
      tags: ['Thành tích'],
      featured: false,
      showInPortfolio: true,
      showInCV: true,
    };
    setFilter('all');
    onChange((prev) => ({ ...prev, achievements: [nextItem, ...prev.achievements] }));
    setExpandedId(nextItem.id);
  };

  const handleDuplicate = (ach: AchievementItem) => {
    const copy: AchievementItem = {
      ...ach,
      id: createId('ach'),
      title: `${ach.title} (Bản sao)`,
      tags: [...ach.tags],
    };
    onChange((prev) => ({ ...prev, achievements: [copy, ...prev.achievements] }));
    setExpandedId(copy.id);
    onNotify?.('info', 'Đã nhân bản thành tích.');
  };

  const handleDelete = (ach: AchievementItem) => {
    onChange((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((item) => item.id !== ach.id),
    }));
    onNotify?.('info', `Đã xóa "${ach.title}".`, {
      label: 'Hoàn tác',
      onClick: onUndo,
    });
  };

  const visibleList = data.achievements.filter((ach) => {
    if (filter === 'portfolio') return ach.showInPortfolio;
    if (filter === 'cv') return ach.showInCV;
    return true;
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <VisibilityFilterBar value={filter} onChange={setFilter} />
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold transition hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" />
          Thêm thành tích
        </button>
      </div>

      {visibleList.map((ach) => {
        const realIdx = data.achievements.findIndex((x) => x.id === ach.id);
        const isOpen = expandedId === ach.id;
        const isFocused = focusTarget?.itemId === ach.id;

        return (
          <div
            key={ach.id}
            ref={(el) => {
              cardRefs.current[ach.id] = el;
            }}
            className={`group/card rounded-xl border bg-white transition ${
              isFocused ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-zinc-200'
            }`}
          >
            <div className="flex items-center justify-between gap-2 p-3">
              <button
                type="button"
                onClick={() => setExpandedId(isOpen ? null : ach.id)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-zinc-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {ach.title || 'Thành tích mới'}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {ach.issuer} • {ach.date}
                  </p>
                </div>
              </button>

              <div className="flex items-center gap-0.5 opacity-45 transition group-hover/card:opacity-100">
                <button
                  type="button"
                  onClick={() => handleDuplicate(ach)}
                  className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                  title="Nhân bản"
                  aria-label="Nhân bản thành tích"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={realIdx <= 0}
                  onClick={() =>
                    onChange((prev) => ({
                      ...prev,
                      achievements: moveItem(prev.achievements, realIdx, -1),
                    }))
                  }
                  className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 disabled:opacity-30"
                  aria-label="Đưa lên"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={realIdx >= data.achievements.length - 1}
                  onClick={() =>
                    onChange((prev) => ({
                      ...prev,
                      achievements: moveItem(prev.achievements, realIdx, 1),
                    }))
                  }
                  className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 disabled:opacity-30"
                  aria-label="Đưa xuống"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(ach)}
                  className="rounded p-1.5 text-rose-500 hover:bg-rose-50"
                  aria-label="Xóa thành tích"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-zinc-100 px-3 py-2">
              <TogglePill
                checked={ach.showInPortfolio}
                label="Hiện ở Portfolio"
                onChange={(next) => updateAchievement(ach.id, { showInPortfolio: next })}
              />
              <TogglePill
                checked={ach.showInCV}
                label="Hiện ở CV"
                onChange={(next) => updateAchievement(ach.id, { showInCV: next })}
              />
              <TogglePill
                checked={ach.featured}
                label="Nổi bật"
                onChange={(next) => updateAchievement(ach.id, { featured: next })}
              />
            </div>

            {isOpen && (
              <div className="space-y-3 border-t border-zinc-100 p-3.5">
                <div className="space-y-1">
                  <label className={labelClass}>Tên thành tích / chứng chỉ</label>
                  <input
                    type="text"
                    value={ach.title}
                    onChange={(e) => updateAchievement(ach.id, { title: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <label className={labelClass}>Phân loại</label>
                    <select
                      value={ach.category}
                      onChange={(e) =>
                        updateAchievement(ach.id, {
                          category: e.target.value as AchievementCategory,
                        })
                      }
                      className={inputClass}
                    >
                      <option value="award">Giải thưởng</option>
                      <option value="certificate">Chứng chỉ</option>
                      <option value="milestone">Dấu mốc</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Đơn vị cấp</label>
                    <input
                      type="text"
                      value={ach.issuer}
                      onChange={(e) => updateAchievement(ach.id, { issuer: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Thời gian</label>
                    <input
                      type="text"
                      value={ach.date}
                      onChange={(e) => updateAchievement(ach.id, { date: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                <ImageUploader
                  label="Ảnh bằng khen / minh chứng (tùy chọn)"
                  value={ach.imageUrl}
                  canSaveLocally={canSaveLocally}
                  onChange={(url) => updateAchievement(ach.id, { imageUrl: url })}
                  onNotify={onNotify}
                />

                <div className="space-y-1">
                  <label className={labelClass}>Mô tả chi tiết trên Portfolio</label>
                  <textarea
                    rows={3}
                    value={ach.description}
                    onChange={(e) =>
                      updateAchievement(ach.id, { description: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Dòng ghi ngắn gọn trên CV</label>
                  <input
                    type="text"
                    value={ach.cvNote}
                    onChange={(e) => updateAchievement(ach.id, { cvNote: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Link xác thực / chứng nhận</label>
                  <input
                    type="text"
                    value={ach.credentialUrl}
                    onChange={(e) =>
                      updateAchievement(ach.id, { credentialUrl: e.target.value })
                    }
                    placeholder="https://..."
                    className={inputClass}
                  />
                </div>

                <TagsInput
                  label="Thẻ liên quan"
                  tags={ach.tags}
                  onChange={(nextTags) => updateAchievement(ach.id, { tags: nextTags })}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function EducationSkillsEditor({
  data,
  onChange,
}: {
  data: PortfolioData;
  onChange: (updater: (prev: PortfolioData) => PortfolioData) => void;
}) {
  const addEducation = () => {
    const nextItem: EducationItem = {
      id: createId('edu'),
      school: 'Tên trường / Chương trình đào tạo',
      degree: 'Chuyên ngành / Bằng cấp',
      period: '2022 – 2026',
      gpaOrHonors: '',
      details: '',
      showInHome: true,
      showInCV: true,
    };
    onChange((prev) => ({ ...prev, education: [...prev.education, nextItem] }));
  };

  const addSkillGroup = () => {
    const nextGroup: SkillGroup = {
      id: createId('sk'),
      category: 'Nhóm kỹ năng mới',
      skills: ['Kỹ năng 1', 'Kỹ năng 2'],
      showInHome: true,
      showInCV: true,
    };
    onChange((prev) => ({ ...prev, skills: [...prev.skills, nextGroup] }));
  };

  return (
    <div className="space-y-6">
      {/* Education */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-sm font-bold text-zinc-900">Học vấn</h3>
          <button
            type="button"
            onClick={addEducation}
            className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm học vấn
          </button>
        </div>

        {data.education.map((edu) => (
          <div
            key={edu.id}
            className="space-y-2.5 rounded-xl border border-zinc-200 bg-white p-3.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <TogglePill
                  checked={edu.showInHome}
                  label="Hiện ở Giới thiệu"
                  onChange={(next) =>
                    onChange((prev) => ({
                      ...prev,
                      education: prev.education.map((item) =>
                        item.id === edu.id ? { ...item, showInHome: next } : item,
                      ),
                    }))
                  }
                />
                <TogglePill
                  checked={edu.showInCV}
                  label="Hiện ở CV"
                  onChange={(next) =>
                    onChange((prev) => ({
                      ...prev,
                      education: prev.education.map((item) =>
                        item.id === edu.id ? { ...item, showInCV: next } : item,
                      ),
                    }))
                  }
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                    education: prev.education.filter((item) => item.id !== edu.id),
                  }))
                }
                className="rounded p-1.5 text-rose-500 hover:bg-rose-50"
                aria-label="Xóa học vấn"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              <input
                type="text"
                value={edu.school}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    education: prev.education.map((item) =>
                      item.id === edu.id ? { ...item, school: e.target.value } : item,
                    ),
                  }))
                }
                placeholder="Tên trường"
                className={inputClass}
              />
              <input
                type="text"
                value={edu.degree}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    education: prev.education.map((item) =>
                      item.id === edu.id ? { ...item, degree: e.target.value } : item,
                    ),
                  }))
                }
                placeholder="Bằng cấp / Chuyên ngành"
                className={inputClass}
              />
              <input
                type="text"
                value={edu.period}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    education: prev.education.map((item) =>
                      item.id === edu.id ? { ...item, period: e.target.value } : item,
                    ),
                  }))
                }
                placeholder="2020 – 2024"
                className={inputClass}
              />
              <input
                type="text"
                value={edu.gpaOrHonors}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    education: prev.education.map((item) =>
                      item.id === edu.id ? { ...item, gpaOrHonors: e.target.value } : item,
                    ),
                  }))
                }
                placeholder="GPA / Danh hiệu"
                className={inputClass}
              />
            </div>

            <textarea
              rows={2}
              value={edu.details}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  education: prev.education.map((item) =>
                    item.id === edu.id ? { ...item, details: e.target.value } : item,
                  ),
                }))
              }
              placeholder="Ghi chú thêm (đồ án, môn tiêu biểu...)"
              className={inputClass}
            />
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="space-y-3 border-t border-zinc-200 pt-5">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-sm font-bold text-zinc-900">Nhóm kỹ năng</h3>
          <button
            type="button"
            onClick={addSkillGroup}
            className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm nhóm
          </button>
        </div>

        {data.skills.map((group) => (
          <div
            key={group.id}
            className="space-y-2.5 rounded-xl border border-zinc-200 bg-white p-3.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <TogglePill
                  checked={group.showInHome}
                  label="Hiện ở Giới thiệu"
                  onChange={(next) =>
                    onChange((prev) => ({
                      ...prev,
                      skills: prev.skills.map((item) =>
                        item.id === group.id ? { ...item, showInHome: next } : item,
                      ),
                    }))
                  }
                />
                <TogglePill
                  checked={group.showInCV}
                  label="Hiện ở CV"
                  onChange={(next) =>
                    onChange((prev) => ({
                      ...prev,
                      skills: prev.skills.map((item) =>
                        item.id === group.id ? { ...item, showInCV: next } : item,
                      ),
                    }))
                  }
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                    skills: prev.skills.filter((item) => item.id !== group.id),
                  }))
                }
                className="rounded p-1.5 text-rose-500 hover:bg-rose-50"
                aria-label="Xóa nhóm kỹ năng"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <input
              type="text"
              value={group.category}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  skills: prev.skills.map((item) =>
                    item.id === group.id ? { ...item, category: e.target.value } : item,
                  ),
                }))
              }
              placeholder="Tên nhóm (VD: Frontend, Thiết kế...)"
              className={inputClass}
            />

            <TagsInput
              label="Danh sách kỹ năng"
              tags={group.skills}
              onChange={(nextSkills) =>
                onChange((prev) => ({
                  ...prev,
                  skills: prev.skills.map((item) =>
                    item.id === group.id ? { ...item, skills: nextSkills } : item,
                  ),
                }))
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
