import type { IncomingMessage, ServerResponse } from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { Plugin } from 'vite';

const MAX_BODY_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB

const MIME_TO_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;
    let settled = false;

    req.on('data', (chunk: Buffer) => {
      if (settled) return;
      totalBytes += chunk.length;
      if (totalBytes > MAX_BODY_BYTES) {
        settled = true;
        reject(new Error('PAYLOAD_TOO_LARGE'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (settled) return;
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('INVALID_JSON'));
      }
    });

    req.on('error', (err) => {
      if (!settled) {
        settled = true;
        reject(err);
      }
    });
  });
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function studioDevPlugin(): Plugin {
  return {
    name: 'studio-dev-plugin',
    configureServer(server) {
      const root = server.config.root;

      server.middlewares.use(async (req, res, next) => {
        const urlPath = req.url?.split('?')[0];
        if (!urlPath?.startsWith('/__studio/')) {
          return next();
        }

        if (urlPath === '/__studio/health' && req.method === 'GET') {
          sendJson(res, 200, { ok: true, mode: 'local-dev' });
          return;
        }

        if (urlPath === '/__studio/save' && req.method === 'POST') {
          try {
            const body = await readJsonBody(req);
            if (!isPlainObject(body) || !isPlainObject(body.profile) || !isPlainObject(body.appearance)) {
              sendJson(res, 400, { ok: false, error: 'Dữ liệu portfolio không hợp lệ (thiếu profile hoặc appearance).' });
              return;
            }

            const updatedAt = new Date().toISOString();
            const payloadToSave = {
              ...body,
              updatedAt,
            };

            const dataFilePath = path.resolve(root, 'src/data/portfolio.json');
            await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
            await fs.writeFile(dataFilePath, `${JSON.stringify(payloadToSave, null, 2)}\n`, 'utf8');

            sendJson(res, 200, { ok: true, updatedAt });
            return;
          } catch (error) {
            const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
            if (message === 'PAYLOAD_TOO_LARGE') {
              sendJson(res, 413, { ok: false, error: 'Kích thước dữ liệu vượt quá giới hạn 5MB.' });
              return;
            }
            sendJson(res, 400, { ok: false, error: 'JSON gửi lên không hợp lệ.' });
            return;
          }
        }

        if (urlPath === '/__studio/upload' && req.method === 'POST') {
          try {
            const body = await readJsonBody(req);
            if (
              !isPlainObject(body) ||
              typeof body.filename !== 'string' ||
              typeof body.dataUrl !== 'string'
            ) {
              sendJson(res, 400, { ok: false, error: 'Thiếu filename hoặc dataUrl.' });
              return;
            }

            const match = body.dataUrl.match(/^data:(image\/(?:png|jpeg|jpg|webp|gif|svg\+xml));base64,([A-Za-z0-9+/=]+)$/);
            if (!match) {
              sendJson(res, 400, { ok: false, error: 'Định dạng ảnh không được hỗ trợ (chỉ chấp nhận PNG, JPG, WEBP, GIF, SVG).' });
              return;
            }

            const mimeType = match[1].toLowerCase();
            const ext = MIME_TO_EXT[mimeType];
            if (!ext) {
              sendJson(res, 400, { ok: false, error: 'Loại tệp không hợp lệ.' });
              return;
            }

            const buffer = Buffer.from(match[2], 'base64');
            if (buffer.length === 0 || buffer.length > MAX_UPLOAD_BYTES) {
              sendJson(res, 400, { ok: false, error: 'Kích thước ảnh phải từ 1 byte đến 5MB.' });
              return;
            }

            const rawBase = path.basename(body.filename, path.extname(body.filename));
            const safeName = rawBase
              .toLowerCase()
              .replace(/[^a-z0-9-_]+/g, '-')
              .replace(/^-+|-+$/g, '')
              .slice(0, 48) || 'image';

            const savedName = `${Date.now()}-${safeName}.${ext}`;
            const uploadDir = path.resolve(root, 'public/uploads');
            await fs.mkdir(uploadDir, { recursive: true });

            const destPath = path.resolve(uploadDir, savedName);
            const relativeCheck = path.relative(uploadDir, destPath);
            if (relativeCheck.startsWith('..') || path.isAbsolute(relativeCheck)) {
              sendJson(res, 400, { ok: false, error: 'Đường dẫn tệp không hợp lệ.' });
              return;
            }

            await fs.writeFile(destPath, buffer);
            sendJson(res, 200, { ok: true, path: `uploads/${savedName}` });
            return;
          } catch (error) {
            const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
            if (message === 'PAYLOAD_TOO_LARGE') {
              sendJson(res, 413, { ok: false, error: 'Dữ liệu ảnh vượt quá giới hạn 5MB.' });
              return;
            }
            sendJson(res, 400, { ok: false, error: 'Không thể xử lý yêu cầu tải ảnh.' });
            return;
          }
        }

        sendJson(res, 404, { ok: false, error: 'Không tìm thấy endpoint Studio.' });
      });
    },
  };
}
