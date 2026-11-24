import type { PortfolioData } from '../types/portfolio';

export interface GitHubSyncConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
}

const GITHUB_SYNC_STORAGE_KEY = 'portfolio_studio_github_sync_v1';
const GITHUB_API_BASE = 'https://api.github.com';
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

export function detectDefaultGitHubTarget(): {
  owner: string;
  repo: string;
  branch: string;
} {
  if (typeof window !== 'undefined') {
    const match = window.location.hostname.match(/^([^.]+)\.github\.io$/i);
    if (match) {
      const owner = match[1];
      const firstSegment = window.location.pathname
        .split('/')
        .map((part) => part.trim())
        .filter(Boolean)[0];
      return {
        owner,
        repo: firstSegment || `${owner}.github.io`,
        branch: 'main',
      };
    }
  }
  return {
    owner: 'Gafona',
    repo: 'phuongthao',
    branch: 'main',
  };
}

export function loadGitHubSyncConfig(): GitHubSyncConfig {
  const defaults = detectDefaultGitHubTarget();
  const empty: GitHubSyncConfig = {
    owner: defaults.owner,
    repo: defaults.repo,
    branch: defaults.branch,
    token: '',
  };

  if (typeof window === 'undefined') return empty;

  try {
    const raw = window.localStorage.getItem(GITHUB_SYNC_STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<GitHubSyncConfig>;
    return {
      owner:
        typeof parsed.owner === 'string' && parsed.owner.trim()
          ? parsed.owner.trim()
          : defaults.owner,
      repo:
        typeof parsed.repo === 'string' && parsed.repo.trim()
          ? parsed.repo.trim()
          : defaults.repo,
      branch:
        typeof parsed.branch === 'string' && parsed.branch.trim()
          ? parsed.branch.trim()
          : defaults.branch,
      token: typeof parsed.token === 'string' ? parsed.token.trim() : '',
    };
  } catch {
    return empty;
  }
}

export function saveGitHubSyncConfig(config: GitHubSyncConfig): void {
  if (typeof window === 'undefined') return;
  try {
    const sanitized: GitHubSyncConfig = {
      owner: config.owner.trim(),
      repo: config.repo.trim(),
      branch: config.branch.trim() || 'main',
      token: config.token.trim(),
    };
    window.localStorage.setItem(GITHUB_SYNC_STORAGE_KEY, JSON.stringify(sanitized));
  } catch {
    // Ignore storage errors
  }
}

export function clearGitHubSyncConfig(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(GITHUB_SYNC_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function isGitHubPublishConfigured(config: GitHubSyncConfig): boolean {
  return Boolean(
    config.owner.trim() && config.repo.trim() && config.branch.trim() && config.token.trim(),
  );
}

/**
 * UTF-8 & emoji safe Base64 encoder using chunked String.fromCharCode conversion.
 */
export function encodeUtf8ToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

function buildHeaders(token: string, withJsonBody = false): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token.trim()}`,
  };
  if (withJsonBody) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

function mapGitHubHttpError(status: number, context: 'repo' | 'file'): string {
  if (status === 401) {
    return 'Token GitHub không hợp lệ hoặc đã hết hạn (401). Hãy tạo lại Token mới.';
  }
  if (status === 403) {
    return 'Token chưa có quyền ghi "Contents: Read and write" trên repo này (403).';
  }
  if (status === 404) {
    return context === 'repo'
      ? 'Không tìm thấy repository GitHub (404). Hãy kiểm tra lại Tên tài khoản & Tên kho.'
      : 'Không tìm thấy file trong nhánh này (404). Kiểm tra lại tên Kho hoặc Nhánh.';
  }
  if (status === 409 || status === 422) {
    return 'Dữ liệu trên GitHub vừa có thay đổi mới (409). Hãy tải lại trang để đồng bộ rồi thử lưu lại.';
  }
  return `Lỗi kết nối GitHub (${status}).`;
}

export async function testGitHubConnection(
  config: GitHubSyncConfig,
): Promise<{ ok: boolean; message: string; repoFullName?: string }> {
  const owner = config.owner.trim();
  const repo = config.repo.trim();
  const token = config.token.trim();

  if (!owner || !repo || !token) {
    return {
      ok: false,
      message: 'Vui lòng điền đủ Tài khoản GitHub, Tên kho (Repo) và Token.',
    };
  }

  try {
    const res = await fetch(
      `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
      {
        method: 'GET',
        headers: buildHeaders(token),
      },
    );

    if (!res.ok) {
      return { ok: false, message: mapGitHubHttpError(res.status, 'repo') };
    }

    const json = (await res.json()) as {
      full_name?: string;
      permissions?: { push?: boolean };
    };

    if (json.permissions && json.permissions.push === false) {
      return {
        ok: false,
        message: 'Tài khoản/Token chỉ có quyền đọc, không có quyền ghi vào repo này.',
      };
    }

    return {
      ok: true,
      repoFullName: json.full_name ?? `${owner}/${repo}`,
      message: `Kết nối thành công tới ${json.full_name ?? `${owner}/${repo}`}!`,
    };
  } catch {
    return {
      ok: false,
      message: 'Không thể kết nối mạng tới GitHub API.',
    };
  }
}

export async function publishPortfolioToGitHub(
  config: GitHubSyncConfig,
  data: PortfolioData,
): Promise<{ ok: boolean; updatedAt?: string; commitUrl?: string; message: string }> {
  if (!isGitHubPublishConfigured(config)) {
    return {
      ok: false,
      message: 'Chưa cấu hình kết nối GitHub Token trong mục Dữ liệu.',
    };
  }

  const owner = config.owner.trim();
  const repo = config.repo.trim();
  const branch = config.branch.trim() || 'main';
  const token = config.token.trim();
  const fileUrl = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
    repo,
  )}/contents/src/data/portfolio.json`;

  try {
    let existingSha: string | undefined;
    const getRes = await fetch(`${fileUrl}?ref=${encodeURIComponent(branch)}`, {
      method: 'GET',
      headers: buildHeaders(token),
    });

    if (getRes.ok) {
      const getJson = (await getRes.json()) as { sha?: string };
      existingSha = getJson.sha;
    } else if (getRes.status !== 404) {
      return { ok: false, message: mapGitHubHttpError(getRes.status, 'file') };
    }

    const updatedAt = new Date().toISOString();
    const cleanPayload: PortfolioData = {
      ...data,
      updatedAt,
    };
    const serialized = `${JSON.stringify(cleanPayload, null, 2)}\n`;
    const contentBase64 = encodeUtf8ToBase64(serialized);

    const putRes = await fetch(fileUrl, {
      method: 'PUT',
      headers: buildHeaders(token, true),
      body: JSON.stringify({
        message: 'Update portfolio via Studio',
        content: contentBase64,
        branch,
        ...(existingSha ? { sha: existingSha } : {}),
      }),
    });

    if (!putRes.ok) {
      return { ok: false, message: mapGitHubHttpError(putRes.status, 'file') };
    }

    const putJson = (await putRes.json()) as {
      commit?: { html_url?: string };
    };

    return {
      ok: true,
      updatedAt,
      commitUrl: putJson.commit?.html_url,
      message:
        'Đã đăng bản cập nhật lên GitHub! Website sẽ tự làm mới sau khoảng 45–60 giây.',
    };
  } catch {
    return {
      ok: false,
      message: 'Lỗi kết nối mạng khi đăng dữ liệu lên GitHub.',
    };
  }
}

export async function uploadImageToGitHub(
  config: GitHubSyncConfig,
  filename: string,
  dataUrl: string,
): Promise<{ ok: boolean; path?: string; error?: string }> {
  if (!isGitHubPublishConfigured(config)) {
    return {
      ok: false,
      error: 'Chưa cấu hình kết nối GitHub trong mục Dữ liệu.',
    };
  }

  const match = dataUrl.match(
    /^data:(image\/(?:png|jpeg|jpg|webp|gif|svg\+xml));base64,([A-Za-z0-9+/=]+)$/,
  );
  if (!match) {
    return {
      ok: false,
      error: 'Định dạng ảnh không hỗ trợ (chỉ nhận PNG, JPG, WEBP, GIF, SVG).',
    };
  }

  const mimeType = match[1].toLowerCase();
  const ext = MIME_TO_EXT[mimeType];
  const rawBase64 = match[2];
  if (!ext) {
    return { ok: false, error: 'Loại tệp ảnh không hợp lệ.' };
  }

  const estimatedBytes = Math.floor((rawBase64.length * 3) / 4);
  if (estimatedBytes <= 0 || estimatedBytes > MAX_UPLOAD_BYTES) {
    return { ok: false, error: 'Kích thước ảnh vượt quá giới hạn 5MB.' };
  }

  const dotIdx = filename.lastIndexOf('.');
  const rawBase = dotIdx > 0 ? filename.slice(0, dotIdx) : filename;
  const safeName =
    rawBase
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'image';

  const savedName = `${Date.now()}-${safeName}.${ext}`;
  const owner = config.owner.trim();
  const repo = config.repo.trim();
  const branch = config.branch.trim() || 'main';
  const token = config.token.trim();

  const uploadUrl = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
    repo,
  )}/contents/public/uploads/${encodeURIComponent(savedName)}`;

  try {
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: buildHeaders(token, true),
      body: JSON.stringify({
        message: `Upload studio asset ${savedName}`,
        content: rawBase64,
        branch,
      }),
    });

    if (!res.ok) {
      return { ok: false, error: mapGitHubHttpError(res.status, 'file') };
    }

    return { ok: true, path: `uploads/${savedName}` };
  } catch {
    return {
      ok: false,
      error: 'Lỗi mạng khi tải ảnh trực tiếp lên GitHub.',
    };
  }
}
