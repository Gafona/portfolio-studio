# Trang Cá Nhân: Giới Thiệu • Portfolio Timeline • CV A4 & Studio

Website hồ sơ cá nhân gọn nhẹ, mã nguồn sạch, không cần backend hay database — phù hợp cho **bất kỳ ngành nghề nào** (thiết kế, truyền thông, kinh doanh, giảng dạy, kỹ thuật, sáng tạo nội dung...).

Dữ liệu tập trung tại một tệp duy nhất (`src/data/portfolio.json`), hiển thị ra **2 không gian công khai tách biệt**:
1. **Giới thiệu & Portfolio Timeline (`#/home`)**: Giao diện *Bầu trời & Sao* (ưu tiên **Chế độ Tối** làm mặc định, có công tắc chuyển Sáng/Tối ở góc trên) kết hợp giới thiệu bản thân, dòng thời gian dự án/thành tích theo năm, **ảnh nền tùy chỉnh** và **sticker trang trí tự do**.
2. **CV chuẩn A4 (`#/cv`)**: Trang sơ yếu lý lịch nền trắng tinh gọn tách khỏi giao diện web và không bị dính sticker trang trí, hỗ trợ 3 mẫu (*Classic*, *Modern Split*, *Executive*) và xuất PDF / in trực tiếp chuẩn A4.

---

## Truy cập & Tự cập nhật ngay trên Web (1 chạm — Không cần đụng code)

Thanh điều hướng phía trên của website công khai **không hiển thị nút Studio**.

- **Cách mở Studio:** Cuộn xuống **dưới cùng chân trang (Footer)** → nhập mật khẩu vào ô **Mật khẩu Studio** → nhấn **Vào Studio**.
- **Mật khẩu tạm ban đầu:** `17181910` (sau khi vào Studio, mở **Dữ liệu → Mật khẩu truy cập Studio** để đặt mật khẩu riêng; hệ thống lưu mã băm `SHA-256` vào `src/data/portfolio.json`).
- **Đăng cập nhật trực tiếp từ Studio lên Web (không cần mở code hay Git):**
  1. Trong Studio, mở mục **Dữ liệu → Kết nối đăng web trực tiếp (1 chạm)**.
  2. Điền tên tài khoản GitHub, tên kho (VD: `phuongthao`), nhánh `main` và dán **GitHub Fine-grained Token** (quyền *Contents: Read and write* giới hạn riêng cho kho đó — Token chỉ lưu cục bộ trong trình duyệt máy của bạn, không bao giờ ghi vào file công khai).
  3. Từ đó về sau mỗi lần sửa chữ, thêm dự án, tải ảnh (lưu vào `public/uploads/`) hoặc kéo thả sticker, bạn chỉ cần nhấn nút **Đăng lên Web** (`Ctrl+S`) ở góc trên bên phải — GitHub Actions sẽ tự động làm mới trang web sau ~45–60 giây.

> **Dùng cho nhiều người / 2 ngành khác nhau:** Nhân bản dự án thành kho riêng, vào Studio → **Dữ liệu → Bắt đầu hồ sơ trống** để tự điền thông tin cho bất kỳ ngành nghề nào.

---

## Chỉnh sửa trên máy cá nhân (tùy chọn cho lập trình viên)

Yêu cầu: [Node.js](https://nodejs.org/) v20+.

```bash
npm install
npm run dev
```

*(Trên Windows PowerShell nếu bị chặn `npm`, chạy `npm.cmd install` và `npm.cmd run dev`.)*

---

## Đẩy lên GitHub & Đổi tên miền (GitHub Pages)

Workflow `.github/workflows/deploy.yml` tự động build (`npm run build`) và phát hành lên GitHub Pages mỗi lần nhánh `main` được cập nhật.

- **Đổi link GitHub Pages (VD thành `https://gafona.github.io/phuongthao/`):** Vào **Settings → General → Repository name** đổi tên repo thành `phuongthao`.
- **Gắn tên miền riêng (`.com`, `.id.vn`...):** Trỏ DNS về GitHub Pages và nhập tên miền vào **Settings → Pages → Custom domain**.
