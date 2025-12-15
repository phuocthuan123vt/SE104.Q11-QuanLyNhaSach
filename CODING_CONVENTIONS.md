# 📘 QUY TẮC VIẾT MÃ & CẤU TRÚC DỰ ÁN (CODING CONVENTIONS)

Tài liệu này quy định các chuẩn mực về cấu trúc, cách đặt tên và quy trình làm việc cho dự án **Quản Lý Nhà Sách (TuTi Team)**. Mục tiêu là giúp code sạch, dễ bảo trì và tránh xung đột khi làm việc nhóm.

---

## 🛠 I. CÔNG NGHỆ SỬ DỤNG (TECH STACK)

| Phần | Công nghệ Chính | Ghi chú |
| :--- | :--- | :--- |
| **Frontend** | ReactJS (Vite) | Hook-based, không dùng Class Component |
| **UI Library** | Ant Design (Antd) | Sử dụng hệ thống Grid và Component có sẵn |
| **State Mngt** | Context API | Quản lý Global State (Auth, Data) |
| **Backend** | Node.js + Express | RESTful API |
| **Architecture** | MVC + Service Layer | Controller - Service - Model (3 Layers) |
| **Database** | MySQL (TiDB) | Sử dụng `mysql2` với Connection Pool |

---

## 🎨 II. QUY TẮC FRONTEND (REACTJS)

### 1. Cấu Trúc Thư Mục
Tuyệt đối tuân thủ việc phân tách logic và giao diện:

```text
src/
├── constants/       # CHỈ chứa hằng số (API_URL, COLORS, IMAGES). Không logic.
├── utils/           # Các hàm tiện ích (formatMoney, handleError). Thuần JS.
├── context/         # Chứa AppContext.jsx (Global State + Gọi API).
├── components/      # Component giao diện (View).
│   ├── auth/        # Màn hình Login/Register.
│   ├── layout/      # Header, Footer, PrintTemplate.
│   ├── tabs/        # Các Tab chức năng lớn (Transaction, Database...).
│   └── modals/      # Các cửa sổ Popup (ImportModal, SellModal...).
└── App.jsx          # Điều hướng chính.
```

### 2. Quy Tắc Đặt Tên
*   **Component & File:** PascalCase. Tên file trùng tên Component.
    *   ✅ `BookList.jsx`, `ImportModal.jsx`
    *   ❌ `bookList.jsx`, `import_modal.jsx`
*   **Biến & Hàm:** camelCase. Tên hàm phải là động từ.
    *   ✅ `fetchBooks`, `isLoading`, `handleLogin`
    *   ❌ `Data`, `func1`
*   **Hằng số:** UPPER_SNAKE_CASE.
    *   ✅ `API_URL`, `DEFAULT_PAGE_SIZE`
*   **Boolean:** Bắt đầu bằng `is`, `has`, `should`.
    *   ✅ `isModalOpen`, `isAdmin`

### 3. Nguyên Tắc Code React
1.  **Context là "Bộ não":** Mọi logic gọi API (`axios`), dữ liệu dùng chung (User, Sách, Khách) phải nằm trong `src/context/AppContext.jsx`.
2.  **Component chỉ hiển thị:** Component con chỉ nhận data và gọi hàm từ Context. Hạn chế tối đa logic phức tạp trong View.
3.  **Không hardcode:**
    *   Màu sắc lấy từ `constants/index.js` (VD: `COLORS.BLUE`).
    *   API URL lấy từ biến môi trường hoặc `constants`.
4.  **Destructuring:** Luôn giải nén props và context.
    ```jsx
    // ✅ Đúng
    const { books, fetchBooks } = useApp();
    // ❌ Sai
    const context = useApp(); context.books;
    ```

---

## ⚙️ III. QUY TẮC BACKEND (NODE.JS)

### 1. Cấu Trúc Thư Mục (3-Layer Architecture)
Backend áp dụng mô hình phân lớp để tách biệt trách nhiệm:

```text
server/src/
├── config/           # Cấu hình DB (Pool connection).
├── controllers/      # Tầng giao tiếp: Nhận Request -> Gọi Service -> Trả Response JSON.
├── services/         # Tầng nghiệp vụ: Chứa logic tính toán, check quy định, Transaction.
├── models/           # Tầng dữ liệu: Chỉ chứa câu lệnh SQL Query.
├── routes/           # Định nghĩa API Endpoint.
└── middlewares/      # Xác thực (Auth), Validate dữ liệu.
```

### 2. Nguyên Tắc Phân Chia Trách Nhiệm (RẤT QUAN TRỌNG)

*   **Controller (`controllers/`):**
    *   ❌ KHÔNG viết câu lệnh SQL (`SELECT`, `INSERT`) tại đây.
    *   ❌ KHÔNG viết logic tính toán (cộng trừ tiền, check tồn kho) tại đây.
    *   ✅ Chỉ nhận `req.body`, `req.params`, gọi hàm bên `Service` và trả về `res.json`.

*   **Service (`services/`):**
    *   ✅ Nơi chứa toàn bộ logic "xương sống".
    *   ✅ Kiểm tra quy định (VD: Tồn kho < MinTon -> Báo lỗi).
    *   ✅ Xử lý Transaction (Bắt đầu transaction, Commit, Rollback).

*   **Model (`models/`):**
    *   ✅ Chỉ thực hiện giao tiếp với Database.

### 3. Xử Lý Transaction & Database
*   **Connection Pool:** Luôn sử dụng `pool` thay vì `createConnection` đơn lẻ để tối ưu hiệu suất.
*   **Transaction:** Với các nghiệp vụ phức tạp (Nhập sách, Bán sách), bắt buộc dùng Transaction (`beginTransaction`, `commit`, `rollback`) để đảm bảo dữ liệu nhất quán.
*   **Async/Await:** Sử dụng 100% `async/await` thay vì Callback hell.

---

## 🚀 IV. QUY TRÌNH GIT (GIT WORKFLOW)

### 1. Branching
*   **`main`**: Nhánh chính, code luôn chạy ổn định. Không push trực tiếp (nên khóa branch này).
*   **`dev`** (nếu có): Nhánh phát triển chung.
*   **Feature Branch:** Khi làm chức năng mới, hãy tạo nhánh riêng từ `main`.
    *   Cú pháp: `feature/ten-chuc-nang` hoặc `fix/ten-loi`
    *   VD: `feature/login-screen`, `fix/import-book-bug`

### 2. Commit Message
Viết rõ ràng, có tiền tố để dễ theo dõi:
*   `feat`: Tính năng mới (VD: `feat: Thêm API bán sách`)
*   `fix`: Sửa lỗi (VD: `fix: Lỗi không hiện avatar`)
*   `refactor`: Tái cấu trúc code (VD: `refactor: Tách file server.js`)
*   `ui`: Chỉnh sửa giao diện nhỏ (VD: `ui: Đổi màu button`)
*   `docs`: Cập nhật tài liệu

### 3. Pull & Push
1.  Trước khi làm việc: `git pull origin main` để lấy code mới nhất.
2.  Sau khi code xong: `git add .` -> `git commit` -> `git push`.
3.  Nếu có xung đột (conflict): Bình tĩnh resolve conflict trên máy cá nhân, test chạy ổn rồi mới push.

---

## 💡 V. MẸO DEBUG NHANH
*   **Frontend lỗi:** Mở DevTools (F12) -> Tab **Console** xem lỗi đỏ. Tab **Network** xem API trả về gì.
*   **Backend lỗi:** Kiểm tra terminal chạy server. Sử dụng `console.log` trong các block `catch(e)` để in chi tiết lỗi.

---
**Made with ❤️ by TuTi Team**
