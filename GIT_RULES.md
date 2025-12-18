# QUY TẮC LÀM VIỆC VÀ QUẢN LÝ MÃ NGUỒN (GIT FLOW)

**Dự án:** Quản Lý Nhà Sách  
**Môn học:** Nhập môn Công nghệ phần mềm

---

## 1. Quy tắc Commit (Commit Convention)

Thống nhất viết commit message bằng **Tiếng Việt**, nhưng phải tuân thủ format chuẩn **Conventional Commits**.

### Cấu trúc

```text
<type>: <mô tả ngắn gọn bằng tiếng Việt>
```

### Các loại Type quy định

| Type         | Ý nghĩa                                    | Ví dụ                                               |
| :----------- | :----------------------------------------- | :-------------------------------------------------- |
| **feat**     | Thêm tính năng mới (Feature)               | `feat: thêm chức năng tìm kiếm sách`                |
| **fix**      | Sửa lỗi (Bug fix)                          | `fix: sửa lỗi tính sai tổng tiền hóa đơn`           |
| **ui**       | Cập nhật giao diện (CSS, màu sắc, layout)  | `ui: chỉnh lại màu nút đăng nhập`                   |
| **refactor** | Sửa code cho gọn, tối ưu (không đổi logic) | `refactor: tách hàm xử lý ngày tháng ra file riêng` |
| **docs**     | Thêm/Sửa tài liệu                          | `docs: cập nhật hướng dẫn cài đặt trong README`     |
| **chore**    | Các việc vặt (config, update package)      | `chore: cài thêm thư viện axios`                    |

### Quy tắc viết mô tả (Description)

1.  **Bắt đầu bằng động từ:** Thêm, Sửa, Cập nhật, Xóa, Tối ưu...
2.  **Ngắn gọn:** Cố gắng giữ dưới 50 ký tự.
3.  **Không** dùng dấu chấm câu (.) ở cuối dòng.
4.  **Viết hoa chữ cái đầu tiên** của mô tả.

**✅ Ví dụ ĐÚNG:**

- `feat: Tạo API lấy danh sách khách hàng`
- `fix: Sửa lỗi crash app khi nhập sai mật khẩu`
- `ui: Cập nhật logo mới ở header`

**❌ Ví dụ SAI:**

- `update code` (Quá chung chung)
- `feat: thêm chức năng.` (Dư dấu chấm)
- `sửa lỗi login` (Thiếu type `fix:`)

---

## 2. Quy tắc đặt tên Nhánh (Branch Naming)

Tuyệt đối **KHÔNG** code trực tiếp trên nhánh `main` (hoặc `master`).

### Cấu trúc

```text
<type>/<tên-chức-năng-không-dấu>
```

### Ví dụ

- Làm chức năng đăng nhập: `feat/chuc-nang-dang-nhap`
- Làm giao diện trang chủ: `ui/giao-dien-trang-chu`
- Sửa lỗi hiển thị sai giá: `fix/loi-hien-thi-gia`

---

## 3. Quy trình làm việc (Workflow)

Để tránh xung đột code (Conflict), mọi thành viên phải tuân thủ quy trình sau:

1.  **Bắt đầu việc mới:**

    - Luôn `git pull origin main` để lấy code mới nhất về máy.
    - Tạo nhánh mới từ `main`: `git checkout -b feat/ten-chuc-nang`.

2.  **Trong quá trình làm:**

    - Code và Commit thường xuyên (theo quy tắc mục 1).
    - Nên commit nhỏ, mỗi commit làm một việc cụ thể.

3.  **Trước khi đẩy code (Push):**

    - Chuyển về nhánh mình đang làm.
    - Kéo code mới nhất từ main về nhánh của mình để xử lý conflict (nếu có) ngay tại máy:
      ```bash
      git pull origin main
      ```
    - Nếu có conflict -> Sửa file -> Commit lại.

4.  **Đẩy code:**

    - `git push origin feat/ten-chuc-nang`

5.  **Merge vào Main:**
    - Vào GitHub tạo **Pull Request (PR)** từ nhánh con vào nhánh `main`.
    - Gửi link PR vào nhóm chat để nhờ bạn khác **Review**.
    - Sau khi được Approve, tiến hành **Merge**.

---

## 4. Quy định chung về Code (Coding Style)

### Naming Convention

- **Biến & Hàm (JS/Node):** `camelCase` (ví dụ: `bookList`, `getUser()`).
- **Component (React):** `PascalCase` (ví dụ: `BookItem.jsx`, `Header.jsx`).
- **Database (MySQL):**
  - Tên bảng: `snake_case` (ví dụ: `books`, `phieu_nhap`).
  - _Lưu ý:_ Cố gắng map dữ liệu về `camelCase` trước khi trả về Frontend.

### Tools bắt buộc

Cài đặt Extension trên VS Code để code tự động đẹp:

1.  **Prettier - Code formatter** (Format code tự động khi Save).
2.  **ESLint** (Báo lỗi cú pháp).