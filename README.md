# Trang Cá Nhân: Giới Thiệu • Portfolio Timeline • CV A4 & Studio

Website hồ sơ cá nhân gọn nhẹ, mã nguồn sạch, không cần backend hay database — phù hợp cho **bất kỳ ngành nghề nào** (thiết kế, truyền thông, kinh doanh, giảng dạy, kỹ thuật, sáng tạo nội dung...).

Dữ liệu tập trung tại một tệp duy nhất (`src/data/portfolio.json`), hiển thị ra **2 không gian công khai tách biệt**:
1. **Giới thiệu & Portfolio Timeline (`#/home`)**: Giao diện *Bầu trời & Sao* (ưu tiên **Chế độ Tối** làm mặc định, có công tắc chuyển Sáng/Tối ở góc trên) kết hợp giới thiệu bản thân, dòng thời gian dự án/thành tích theo năm, **ảnh nền tùy chỉnh** và **sticker trang trí tự do**.
2. **CV chuẩn A4 (`#/cv`)**: Trang sơ yếu lý lịch nền trắng tinh gọn tách khỏi giao diện web và không bị dính sticker trang trí, hỗ trợ 3 mẫu (*Classic*, *Modern Split*, *Executive*) và xuất PDF / in trực tiếp chuẩn A4.

---

## Truy cập & Tùy biến Studio (Bảo vệ bằng mật khẩu)

Thanh điều hướng phía trên của website công khai **không hiển thị nút Studio** để người xem không bấm nhầm.

- Để mở trình chỉnh sửa: cuộn xuống **dưới cùng chân trang (Footer)** → nhập mật khẩu vào ô **Mật khẩu Studio** → nhấn **Vào Studio** (hoặc truy cập trực tiếp `#/studio` sau khi mở khóa).
- **Mật khẩu tạm ban đầu:** `17181910`
- **Đổi mật khẩu:** Sau khi vào Studio, mở mục **Dữ liệu → Mật khẩu truy cập Studio** để đặt mật khẩu riêng của bạn (hệ thống lưu mã băm `SHA-256` vào `src/data/portfolio.json`).
- **Đổi ảnh nền tùy chỉnh:** Vào **Giao diện → Ảnh nền tùy chỉnh** để tải ảnh nền riêng (dùng chung hoặc tách riêng cho Chế độ Tối/Sáng), chọn kiểu phủ đầu trang/toàn trang, độ mờ phông và lớp phủ bảo vệ độ rõ chữ.
- **Tự trang trí bằng Sticker:** Vào mục **Trang trí** trong Studio để chọn sticker vẽ sẵn, tải ảnh PNG nền trong suốt, nhãn chữ hoặc emoji; sau đó **kéo thả đến bất kỳ vị trí nào trên web, xoay góc, thu phóng, chỉnh lớp Nổi/Chìm và hiệu ứng** trực tiếp trên khung Xem trước.

> **Dùng cho nhiều người / 2 ngành khác nhau:** Bạn và người thân (chị gái) có thể nhân bản dự án ra 2 thư mục (hoặc 2 repository GitHub riêng), vào Studio → **Dữ liệu → Bắt đầu hồ sơ trống** để nhập hoàn toàn theo ngành nghề, vai trò, dự án và phong cách riêng của từng người.

---

## Cài đặt & Chỉnh sửa trên máy cá nhân

Yêu cầu: đã cài [Node.js](https://nodejs.org/) (v20 trở lên).

```bash
# 1. Cài thư viện (lần đầu)
npm install

# 2. Chạy web ở máy cá nhân
npm run dev
```

*(Trên Windows PowerShell nếu bị chặn lệnh `npm`, hãy chạy `npm.cmd install` và `npm.cmd run dev`.)*

Mở `http://localhost:5173`:
- Kéo xuống cuối trang, nhập mật khẩu để vào **Studio**.
- Tự sửa thông tin, thêm dự án / công việc / thành tích, tải ảnh (lưu vào `public/uploads/`), đổi ảnh nền, kéo thả sticker hoặc đổi mật khẩu Studio.
- Nhấn **Lưu** (`Ctrl+S`) để ghi thẳng vào `src/data/portfolio.json`.

---

## Hướng dẫn đưa lên GitHub & Public miễn phí (GitHub Pages)

Dự án đã tích hợp sẵn workflow `.github/workflows/deploy.yml` để tự động build và deploy lên GitHub Pages.

1. **Tạo repository mới trên GitHub** (ví dụ `portfolio-ca-nhan`, hoặc tách 2 repo riêng cho 2 chị em).
2. **Đẩy mã nguồn từ máy lên nhánh `main`:**
   ```bash
   git add .
   git commit -m "Ready for GitHub deployment"
   git branch -M main
   git remote add origin https://github.com/<ten-tai-khoan>/<ten-repo>.git
   git push -u origin main
   ```
3. **Bật GitHub Pages:**
   - Vào **Settings → Pages** trên repository GitHub.
   - Ở mục **Build and deployment → Source**, chọn **GitHub Actions**.
   - Sau khoảng 1 phút, trang web sẽ tự động xuất bản tại `https://<ten-tai-khoan>.github.io/<ten-repo>/`.

*(Lưu ý: Khi chạy bản tĩnh trên GitHub Pages, thay đổi trong Studio chỉ lưu nháp trên trình duyệt hiện tại. Muốn cập nhật cố định cho mọi người cùng xem, hãy nhấn **Export JSON** thay vào `src/data/portfolio.json` rồi `git push`, hoặc chạy `npm run dev` trên máy và bấm **Lưu** trước khi `git push`.)*
