import { useRef, useState, type FormEvent } from 'react';
import {
  CheckCircle2,
  Circle,
  Download,
  FilePlus2,
  KeyRound,
  Lock,
  RotateCcw,
  Sparkles,
  Upload,
} from 'lucide-react';
import type { PortfolioData, StudioSectionId } from '../types/portfolio';
import { getProfileCompleteness } from '../utils/normalize';
import { hashStudioPassword, verifyStudioPassword } from '../utils/studioAuth';

interface DataManagerPanelProps {
  data: PortfolioData;
  canSaveLocally: boolean;
  onUpdateData: (updater: (prev: PortfolioData) => PortfolioData) => void;
  onExportJson: () => void;
  onImportJson: (file: File) => Promise<{ ok: boolean; message: string }>;
  onLoadBlankProfile: () => void;
  onRestoreSampleData: () => void;
  onLockStudio?: () => void;
  onJumpSection: (section: StudioSectionId) => void;
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export function DataManagerPanel({
  data,
  canSaveLocally,
  onUpdateData,
  onExportJson,
  onImportJson,
  onLoadBlankProfile,
  onRestoreSampleData,
  onLockStudio,
  onJumpSection,
  onNotify,
}: DataManagerPanelProps) {
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [confirmMode, setConfirmMode] = useState<'blank' | 'sample' | null>(null);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdUpdating, setPwdUpdating] = useState(false);

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pwdUpdating) return;
    setPwdError('');

    const currentValid = await verifyStudioPassword(currentPwd, data.studioAccess?.passwordHash);
    if (!currentValid) {
      setPwdError('Mật khẩu hiện tại chưa đúng.');
      return;
    }

    const nextTrimmed = newPwd.trim();
    if (nextTrimmed.length < 4) {
      setPwdError('Mật khẩu mới cần tối thiểu 4 ký tự.');
      return;
    }

    if (nextTrimmed !== confirmPwd.trim()) {
      setPwdError('Xác nhận mật khẩu mới chưa khớp.');
      return;
    }

    setPwdUpdating(true);
    try {
      const nextHash = await hashStudioPassword(nextTrimmed);
      onUpdateData((prev) => ({
        ...prev,
        studioAccess: { passwordHash: nextHash },
      }));
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      onNotify(
        'success',
        canSaveLocally
          ? 'Đã cập nhật mật khẩu Studio mới. Nhấn "Lưu" (Ctrl+S) để ghi cố định vào portfolio.json.'
          : 'Đã cập nhật mật khẩu trong bản nháp. Dùng "Export JSON" để lưu vào src/data/portfolio.json trên GitHub.',
      );
    } finally {
      setPwdUpdating(false);
    }
  };

  const completeness = getProfileCompleteness(data);

  const portfolioCount =
    data.projects.filter((p) => p.showInPortfolio).length +
    data.achievements.filter((a) => a.showInPortfolio).length +
    data.experiences.filter((e) => e.showInPortfolio).length;

  const cvCount =
    data.projects.filter((p) => p.showInCV).length +
    data.achievements.filter((a) => a.showInCV).length +
    data.experiences.filter((e) => e.showInCV).length;

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const res = await onImportJson(file);
    onNotify(res.ok ? 'success' : 'error', res.message);
  };

  return (
    <div className="space-y-5">
      {/* Completeness Score */}
      <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="font-heading text-sm font-bold text-zinc-900">
              Mức độ hoàn thiện hồ sơ
            </h3>
            <p className="text-xs text-zinc-500">
              Bấm vào mục chưa hoàn thành để nhảy nhanh đến phần chỉnh sửa.
            </p>
          </div>
          <span className="font-mono text-lg font-bold text-blue-600">
            {completeness.percent}%
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${completeness.percent}%` }}
          />
        </div>

        <div className="space-y-1.5 pt-1">
          {completeness.checks.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onJumpSection(item.targetSection)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition hover:bg-zinc-50"
            >
              {item.done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-zinc-300" />
              )}
              <span
                className={
                  item.done ? 'text-zinc-500 line-through' : 'font-medium text-zinc-800'
                }
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Distribution Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-3.5">
          <p className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
            Hiển thị Portfolio
          </p>
          <p className="font-heading mt-1 text-2xl font-bold text-zinc-900">
            {portfolioCount} <span className="text-xs font-normal text-zinc-500">mục</span>
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-3.5">
          <p className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
            Hiển thị CV A4
          </p>
          <p className="font-heading mt-1 text-2xl font-bold text-zinc-900">
            {cvCount} <span className="text-xs font-normal text-zinc-500">mục</span>
          </p>
        </div>
      </div>

      {/* Recommended Content Density Guide */}
      <div className="space-y-2.5 rounded-xl border border-zinc-200 bg-white p-4">
        <div>
          <h3 className="font-heading text-sm font-bold text-zinc-900">
            Định lượng nội dung khuyên dùng
          </h3>
          <p className="text-xs text-zinc-500">
            Ngưỡng tham khảo giúp bố cục Giới thiệu, Timeline và CV A4 cân đối nhất.
          </p>
        </div>
        <div className="grid gap-2 text-xs sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-100 bg-zinc-50/70 px-3 py-2">
            <p className="font-semibold text-zinc-800">Tagline Hero</p>
            <p className="text-zinc-500">
              Nên 12–30 chữ · Hiện tại:{' '}
              <span className="font-semibold text-zinc-800">
                {data.profile.tagline.trim() ? data.profile.tagline.trim().split(/\s+/).length : 0}{' '}
                chữ
              </span>
            </p>
          </div>
          <div className="rounded-lg border border-zinc-100 bg-zinc-50/70 px-3 py-2">
            <p className="font-semibold text-zinc-800">Con số nổi bật</p>
            <p className="text-zinc-500">
              Nên 2–3 chỉ số · Hiện tại:{' '}
              <span className="font-semibold text-zinc-800">
                {data.profile.highlights.length} chỉ số
              </span>
            </p>
          </div>
          <div className="rounded-lg border border-zinc-100 bg-zinc-50/70 px-3 py-2">
            <p className="font-semibold text-zinc-800">Giới thiệu bản thân</p>
            <p className="text-zinc-500">
              Nên 60–140 chữ · Hiện tại:{' '}
              <span className="font-semibold text-zinc-800">
                {data.profile.aboutStory.trim()
                  ? data.profile.aboutStory.trim().split(/\s+/).length
                  : 0}{' '}
                chữ
              </span>
            </p>
          </div>
          <div className="rounded-lg border border-zinc-100 bg-zinc-50/70 px-3 py-2">
            <p className="font-semibold text-zinc-800">Mật độ Timeline / CV</p>
            <p className="text-zinc-500">
              Portfolio: 4–8 mục · CV A4: 2–5 mục chọn lọc
            </p>
          </div>
        </div>
      </div>

      {/* JSON Import / Export */}
      <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
        <div>
          <h3 className="font-heading text-sm font-bold text-zinc-900">
            Sao lưu &amp; Chuyển dữ liệu JSON
          </h3>
          <p className="text-xs text-zinc-500">
            Xuất file <code>portfolio.json</code> để dự phòng hoặc nhập bản sao lưu từ máy khác.
          </p>
        </div>

        <input
          ref={importInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImportFile}
          className="hidden"
        />

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onExportJson}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-100"
          >
            <Download className="h-3.5 w-3.5" />
            Export JSON
          </button>
          <button
            type="button"
            onClick={() => importInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-100"
          >
            <Upload className="h-3.5 w-3.5" />
            Import JSON
          </button>
        </div>
      </div>

      {/* Studio Access Password Manager */}
      <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="flex items-center gap-1.5 font-heading text-sm font-bold text-zinc-900">
              <KeyRound className="h-3.5 w-3.5 text-zinc-700" />
              Mật khẩu truy cập Studio
            </h3>
            <p className="text-xs text-zinc-500">
              Bảo vệ lối vào Studio dưới chân trang bằng mật khẩu riêng của bạn (hỗ trợ lưu mã băm
              SHA-256 vào <code>portfolio.json</code>).
            </p>
          </div>
          {onLockStudio && (
            <button
              type="button"
              onClick={onLockStudio}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 transition hover:bg-zinc-100"
            >
              <Lock className="h-3 w-3" />
              Khóa ngay
            </button>
          )}
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-2">
          <input
            type="password"
            value={currentPwd}
            onChange={(e) => {
              setCurrentPwd(e.target.value);
              if (pwdError) setPwdError('');
            }}
            placeholder="Mật khẩu hiện tại"
            autoComplete="current-password"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-blue-500"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="password"
              value={newPwd}
              onChange={(e) => {
                setNewPwd(e.target.value);
                if (pwdError) setPwdError('');
              }}
              placeholder="Mật khẩu mới (>= 4 ký tự)"
              autoComplete="new-password"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-blue-500"
            />
            <input
              type="password"
              value={confirmPwd}
              onChange={(e) => {
                setConfirmPwd(e.target.value);
                if (pwdError) setPwdError('');
              }}
              placeholder="Nhập lại mật khẩu mới"
              autoComplete="new-password"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-blue-500"
            />
          </div>

          {pwdError && (
            <p role="alert" className="text-[11px] font-medium text-rose-600">
              {pwdError}
            </p>
          )}

          <button
            type="submit"
            disabled={pwdUpdating}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
          >
            {pwdUpdating ? 'Đang cập nhật...' : 'Cập nhật mật khẩu Studio'}
          </button>
        </form>
      </div>

      {/* Starter & Blank Templates */}
      <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
        <div>
          <h3 className="font-heading text-sm font-bold text-zinc-900">
            Khởi tạo hồ sơ cho người mới / ngành khác
          </h3>
          <p className="text-xs text-zinc-500">
            Xóa dữ liệu mẫu để bạn hoặc người thân tự nhập hồ sơ cho bất kỳ ngành nghề nào mà vẫn
            giữ nguyên giao diện &amp; mật khẩu Studio (có thể Hoàn tác bằng Undo).
          </p>
        </div>

        <div className="space-y-2">
          {confirmMode === 'blank' ? (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2">
              <span className="text-xs font-medium text-rose-800">
                Xóa sạch để tự điền từ đầu?
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onLoadBlankProfile();
                    setConfirmMode(null);
                    onNotify(
                      'info',
                      'Đã tạo hồ sơ trống để bạn tự nhập. Chưa ghi đè file cho tới khi bấm Lưu.',
                    );
                  }}
                  className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-700"
                >
                  Xác nhận
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmMode(null)}
                  className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-zinc-700"
                >
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmMode('blank')}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-50"
            >
              <FilePlus2 className="h-3.5 w-3.5" />
              Bắt đầu hồ sơ trống (xóa dữ liệu mẫu)
            </button>
          )}

          {confirmMode === 'sample' ? (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
              <span className="text-xs font-medium text-blue-900">
                Nạp lại dữ liệu mẫu ban đầu?
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onRestoreSampleData();
                    setConfirmMode(null);
                    onNotify('info', 'Đã nạp lại bộ dữ liệu mẫu.');
                  }}
                  className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Nạp lại
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmMode(null)}
                  className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-zinc-700"
                >
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmMode('sample')}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Nạp lại bộ dữ liệu mẫu tham khảo
            </button>
          )}
        </div>

        <p className="flex items-center gap-1 text-[11px] text-zinc-400">
          <RotateCcw className="h-3 w-3" />
          Cập nhật lần cuối: {new Date(data.updatedAt).toLocaleString('vi-VN')}
        </p>
      </div>
    </div>
  );
}
