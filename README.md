# Trang Cá Nhân: Giới Thiệu • Portfolio Timeline • CV A4 & Studio

Website hồ sơ cá nhân gọn nhẹ, mã nguồn sạch — phù hợp cho **bất kỳ ngành nghề nào** (thiết kế, truyền thông, kinh doanh, giảng dạy, kỹ thuật, sáng tạo nội dung...).

Dữ liệu hiển thị ra **2 không gian công khai tách biệt**:
1. **Giới thiệu & Portfolio Timeline (`#/home`)**: Giao diện *Bầu trời & Sao* (ưu tiên **Chế độ Tối** làm mặc định, có công tắc chuyển Sáng/Tối ở góc trên) kết hợp giới thiệu bản thân, dòng thời gian dự án/thành tích theo năm, **ảnh nền tùy chỉnh** và **sticker trang trí tự do**.
2. **CV chuẩn A4 (`#/cv`)**: Trang sơ yếu lý lịch nền trắng tinh gọn tách khỏi giao diện web và không bị dính sticker trang trí, hỗ trợ 3 mẫu (*Classic*, *Modern Split*, *Executive*) và xuất PDF / in trực tiếp chuẩn A4.

---

## Cách 1 (Khuyên dùng cho người không rành kỹ thuật): Triển khai lên Firebase Miễn Phí (Spark Plan)

Với Firebase Spark (miễn phí **không cần thẻ tín dụng**), chủ sở hữu chỉ cần mở link web, cuộn xuống cuối trang **nhập mật khẩu Studio**, sửa chữ/up ảnh/kéo sticker và bấm **`Lưu lên Web`** — trang web cập nhật **tức thì dưới 1 giây**, hoàn toàn không cần Token hay GitHub.

### Thiết lập 1 lần mất ~5 phút:
1. **Tạo dự án Firebase:** Mở [console.firebase.google.com](https://console.firebase.google.com/) → **Create a project** (đặt tên/ID tuỳ ý, VD: `my-portfolio`, có thể tắt Google Analytics cho nhanh).
2. **Bật đăng nhập bằng Mật khẩu:** Vào **Authentication → Sign-in method** → bật **Email/Password** → sang tab **Users → Add user**:
   - Email: `studio@portfolio.app` *(khớp `VITE_FIREBASE_STUDIO_EMAIL`)*
   - Password mặc định: tự đặt (tối thiểu 6 ký tự, VD: `00000000`, có thể đổi lại trong Studio)
3. **Tạo cơ sở dữ liệu Firestore (Standard):** Vào **Firestore Database → Create database** → chọn **Standard edition** → chọn vùng gần Việt Nam (VD: `asia-southeast1` Singapore) → chọn **Start in production mode**.
4. **Điền cấu hình vào `.env.local`:** Vào **Project settings (bánh răng) → Your apps → Web (`</>`)** đăng ký 1 Web App → chép 6 giá trị `firebaseConfig` vào file `.env.local` ở thư mục dự án (dựa theo `.env.example`):
   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_FIREBASE_STUDIO_EMAIL=studio@portfolio.app
   ```
   *(Lưu ý: `.env.local` và `.firebaserc` đều đã nằm trong `.gitignore`, không bị đẩy lên Git công khai).*
5. **Đẩy web & quy tắc bảo mật lên Firebase:**
   ```bash
   npx.cmd firebase-tools login
   npx.cmd firebase-tools use <your-project-id>
   npm.cmd run deploy:firebase
   ```
   Xong bước này, trang web chạy chính thức tại `https://<your-project-id>.web.app`!

---

## Cách 2: Chạy tĩnh trên GitHub Pages

Khi không cấu hình Firebase env (`.env.local` rỗng), ứng dụng tự dùng `src/data/portfolio.json`, hỗ trợ đăng nhập bằng mật khẩu mặc định `00000000` (mã băm `SHA-256`) và hỗ trợ kết nối **Đăng lên Web (1 chạm)** bằng GitHub Fine-grained Token trong mục **Dữ liệu**.

- **Link GitHub Pages:** Tự động deploy qua GitHub Actions tại `https://<your-username>.github.io/<repo-name>/` (có thể đổi tên repo trong **Settings → General → Repository name**).
- **Gắn tên miền riêng (`.com`, `.id.vn`...):** Hỗ trợ miễn phí cả trên Firebase Hosting và GitHub Pages.

---

## Chỉnh sửa trên máy cá nhân (tùy chọn)

Yêu cầu: [Node.js](https://nodejs.org/) v20+.

```bash
npm install
npm run dev
```

*(Trên Windows PowerShell nếu bị chặn `npm`, chạy `npm.cmd install` và `npm.cmd run dev`.)*
