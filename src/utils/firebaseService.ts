import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  EmailAuthProvider,
  getAuth,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  type Auth,
} from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc, type Firestore } from 'firebase/firestore';
import type { PortfolioData } from '../types/portfolio';
import { createId, hasPreviewAsset, registerPreviewAsset } from './assets';
import { normalizePortfolioData } from './normalize';

const MAX_FIRESTORE_ASSET_LENGTH = 850000;
const FIREBASE_ASSET_PREFIX = 'fb-asset://';

function getEnv(key: string): string {
  if (typeof import.meta === 'undefined') return '';
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  return typeof env?.[key] === 'string' ? env[key]!.trim() : '';
}

const projectId = getEnv('VITE_FIREBASE_PROJECT_ID');

const FIREBASE_CONFIG = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain:
    getEnv('VITE_FIREBASE_AUTH_DOMAIN') || (projectId ? `${projectId}.firebaseapp.com` : ''),
  projectId,
  storageBucket:
    getEnv('VITE_FIREBASE_STORAGE_BUCKET') || (projectId ? `${projectId}.firebasestorage.app` : ''),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID'),
};

export const IS_FIREBASE_CONFIGURED = Boolean(
  FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId && FIREBASE_CONFIG.appId,
);

export function getStudioAuthEmail(): string {
  return getEnv('VITE_FIREBASE_STUDIO_EMAIL') || 'studio@portfolio.app';
}

export function getFirebaseProjectId(): string {
  return FIREBASE_CONFIG.projectId;
}

interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

let cachedServices: FirebaseServices | null = null;

function getFirebaseServices(): FirebaseServices {
  if (cachedServices) return cachedServices;
  const app = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG);
  const auth = getAuth(app);
  const db = getFirestore(app);
  cachedServices = { app, auth, db };
  return cachedServices;
}

/**
 * Recursively strips `undefined` object values because Cloud Firestore rejects `undefined`.
 */
export function stripUndefinedDeep<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => stripUndefinedDeep(item))
      .filter((item) => item !== undefined) as unknown as T;
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) {
        out[k] = stripUndefinedDeep(v);
      }
    }
    return out as T;
  }
  return value;
}

function mapFirebaseAuthError(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code)
      : '';
  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found' ||
    code === 'auth/invalid-email'
  ) {
    return 'Mật khẩu Studio chưa đúng.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Bạn thử sai quá nhiều lần. Vui lòng đợi ít phút rồi thử lại.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Không thể kết nối mạng tới máy chủ Firebase.';
  }
  if (code === 'auth/weak-password') {
    return 'Mật khẩu Firebase cần tối thiểu 6 ký tự.';
  }
  return 'Xác thực Studio thất bại. Vui lòng thử lại.';
}

export async function signInStudioWithFirebase(
  password: string,
): Promise<{ ok: boolean; message?: string }> {
  if (!IS_FIREBASE_CONFIGURED) {
    return { ok: false, message: 'Firebase chưa được cấu hình.' };
  }
  const trimmed = password.trim();
  if (!trimmed) {
    return { ok: false, message: 'Vui lòng nhập mật khẩu.' };
  }
  try {
    const { auth } = getFirebaseServices();
    await signInWithEmailAndPassword(auth, getStudioAuthEmail(), trimmed);
    return { ok: true };
  } catch (err) {
    return { ok: false, message: mapFirebaseAuthError(err) };
  }
}

export async function signOutStudioFirebase(): Promise<void> {
  if (!IS_FIREBASE_CONFIGURED) return;
  try {
    const { auth } = getFirebaseServices();
    await signOut(auth);
  } catch {
    // Ignore signout error
  }
}

export function subscribeFirebaseStudioAuth(onChange: (signedIn: boolean) => void): () => void {
  if (!IS_FIREBASE_CONFIGURED) {
    return () => {};
  }
  const { auth } = getFirebaseServices();
  return onAuthStateChanged(auth, (user) => {
    onChange(Boolean(user));
  });
}

export async function changeFirebaseStudioPassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: boolean; message: string }> {
  if (!IS_FIREBASE_CONFIGURED) {
    return { ok: false, message: 'Firebase chưa được cấu hình.' };
  }
  const trimmedNext = newPassword.trim();
  if (trimmedNext.length < 6) {
    return { ok: false, message: 'Mật khẩu mới trên Firebase cần tối thiểu 6 ký tự.' };
  }
  const { auth } = getFirebaseServices();
  const user = auth.currentUser;
  if (!user) {
    return { ok: false, message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.' };
  }
  try {
    const cred = EmailAuthProvider.credential(
      user.email || getStudioAuthEmail(),
      currentPassword.trim(),
    );
    await reauthenticateWithCredential(user, cred);
    await updatePassword(user, trimmedNext);
    return { ok: true, message: 'Đã đổi mật khẩu Studio trên Firebase thành công!' };
  } catch (err) {
    return { ok: false, message: mapFirebaseAuthError(err) };
  }
}

export async function loadPortfolioFromFirestore(
  fallback: PortfolioData,
): Promise<PortfolioData | null> {
  if (!IS_FIREBASE_CONFIGURED) return null;
  try {
    const { db } = getFirebaseServices();
    const snap = await getDoc(doc(db, 'site', 'portfolio'));
    if (!snap.exists()) return null;
    return normalizePortfolioData(snap.data(), fallback);
  } catch {
    return null;
  }
}

export async function savePortfolioToFirestore(
  data: PortfolioData,
): Promise<{ ok: boolean; updatedAt?: string; message: string }> {
  if (!IS_FIREBASE_CONFIGURED) {
    return { ok: false, message: 'Firebase chưa được cấu hình.' };
  }
  const { auth, db } = getFirebaseServices();
  if (!auth.currentUser) {
    return {
      ok: false,
      message: 'Phiên chỉnh sửa đã hết hạn. Vui lòng đăng nhập lại bằng mật khẩu Studio.',
    };
  }

  const updatedAt = new Date().toISOString();
  const rawPayload: PortfolioData = {
    ...data,
    version: Math.trunc(data.version || 7),
    updatedAt,
  };
  const cleanPayload = stripUndefinedDeep(rawPayload);

  try {
    await setDoc(doc(db, 'site', 'portfolio'), cleanPayload);
    return {
      ok: true,
      updatedAt,
      message: 'Đã lưu & cập nhật trực tiếp lên trang web!',
    };
  } catch (err) {
    const code =
      typeof err === 'object' && err !== null && 'code' in err
        ? String((err as { code?: unknown }).code)
        : '';
    if (code === 'permission-denied') {
      return {
        ok: false,
        message: 'Không có quyền ghi vào Firestore (kiểm tra Security Rules hoặc đăng nhập lại).',
      };
    }
    return {
      ok: false,
      message: 'Lỗi kết nối khi lưu dữ liệu lên Firebase. Vui lòng thử lại.',
    };
  }
}

function parseImageDataUrl(dataUrl: string): { contentType: string; base64Len: number } | null {
  const match = dataUrl.match(
    /^data:(image\/(?:png|jpeg|jpg|webp|gif|svg\+xml));base64,([A-Za-z0-9+/=]+)$/,
  );
  if (!match) return null;
  return { contentType: match[1].toLowerCase(), base64Len: dataUrl.length };
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('IMAGE_DECODE_FAILED'));
    img.src = src;
  });
}

export async function compressImageForFirestore(
  dataUrl: string,
  maxDim = 1600,
): Promise<{ dataUrl: string; contentType: string; sizeBytes: number }> {
  const parsed = parseImageDataUrl(dataUrl);
  if (!parsed) {
    throw new Error('Định dạng ảnh không hợp lệ (hỗ trợ PNG, JPG, WEBP, GIF, SVG).');
  }

  if (dataUrl.length <= 450000 || parsed.contentType === 'image/svg+xml') {
    if (dataUrl.length > MAX_FIRESTORE_ASSET_LENGTH) {
      throw new Error('Ảnh SVG quá lớn (giới hạn 850KB).');
    }
    return {
      dataUrl,
      contentType: parsed.contentType,
      sizeBytes: dataUrl.length,
    };
  }

  if (parsed.contentType === 'image/gif') {
    if (dataUrl.length <= MAX_FIRESTORE_ASSET_LENGTH) {
      return {
        dataUrl,
        contentType: parsed.contentType,
        sizeBytes: dataUrl.length,
      };
    }
    throw new Error('Ảnh GIF động quá lớn (> 850KB). Vui lòng chọn ảnh nhẹ hơn.');
  }

  const img = await loadHtmlImage(dataUrl);
  const attempts: Array<{ dim: number; quality: number; mime: string }> = [
    { dim: maxDim, quality: 0.86, mime: 'image/webp' },
    { dim: 1280, quality: 0.76, mime: 'image/webp' },
    { dim: 960, quality: 0.68, mime: 'image/webp' },
    { dim: 960, quality: 0.72, mime: 'image/jpeg' },
  ];

  for (const step of attempts) {
    const scale = Math.min(1, step.dim / Math.max(img.width, img.height, 1));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    ctx.drawImage(img, 0, 0, width, height);
    const candidate = canvas.toDataURL(step.mime, step.quality);
    if (candidate.startsWith('data:image/') && candidate.length <= MAX_FIRESTORE_ASSET_LENGTH) {
      const candidateParsed = parseImageDataUrl(candidate);
      return {
        dataUrl: candidate,
        contentType: candidateParsed?.contentType ?? step.mime,
        sizeBytes: candidate.length,
      };
    }
  }

  throw new Error('Ảnh quá lớn không thể nén dưới ngưỡng 850KB của Firestore.');
}

export async function uploadAssetToFirestore(
  filename: string,
  dataUrl: string,
): Promise<{ ok: boolean; path?: string; error?: string }> {
  if (!IS_FIREBASE_CONFIGURED) {
    return { ok: false, error: 'Firebase chưa được cấu hình.' };
  }
  const { auth, db } = getFirebaseServices();
  const user = auth.currentUser;
  if (!user) {
    return { ok: false, error: 'Vui lòng mở khóa Studio trước khi tải ảnh lên.' };
  }

  try {
    const compressed = await compressImageForFirestore(dataUrl);
    const assetId = createId('ast');
    await setDoc(doc(db, 'assets', assetId), {
      ownerUid: user.uid,
      filename: filename.slice(0, 120) || 'image',
      contentType: compressed.contentType,
      sizeBytes: compressed.sizeBytes,
      dataUrl: compressed.dataUrl,
      updatedAt: new Date().toISOString(),
    });
    const refPath = `${FIREBASE_ASSET_PREFIX}${assetId}`;
    registerPreviewAsset(refPath, compressed.dataUrl);
    return { ok: true, path: refPath };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Không thể tải ảnh lên Firebase.',
    };
  }
}

export function extractFirebaseAssetIds(data: unknown): string[] {
  const found = new Set<string>();
  const walk = (node: unknown) => {
    if (typeof node === 'string') {
      const trimmed = node.trim();
      if (trimmed.startsWith(FIREBASE_ASSET_PREFIX)) {
        const id = trimmed.slice(FIREBASE_ASSET_PREFIX.length).trim();
        if (/^[a-zA-Z0-9_-]+$/.test(id)) {
          found.add(id);
        }
      }
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (typeof node === 'object' && node !== null) {
      Object.values(node).forEach(walk);
    }
  };
  walk(data);
  return Array.from(found);
}

export async function hydrateFirebaseAssets(data: PortfolioData): Promise<number> {
  if (!IS_FIREBASE_CONFIGURED) return 0;
  const ids = extractFirebaseAssetIds(data).filter(
    (id) => !hasPreviewAsset(`${FIREBASE_ASSET_PREFIX}${id}`),
  );
  if (ids.length === 0) return 0;

  const { db } = getFirebaseServices();
  let hydrated = 0;

  await Promise.all(
    ids.map(async (id) => {
      try {
        const snap = await getDoc(doc(db, 'assets', id));
        if (!snap.exists()) return;
        const payload = snap.data() as { dataUrl?: unknown };
        if (typeof payload.dataUrl === 'string' && payload.dataUrl.startsWith('data:image/')) {
          registerPreviewAsset(`${FIREBASE_ASSET_PREFIX}${id}`, payload.dataUrl);
          hydrated += 1;
        }
      } catch {
        // Ignore single missing asset read error
      }
    }),
  );

  return hydrated;
}
