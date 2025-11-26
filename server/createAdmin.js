// server/createAdmin.js
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ask = (question) => {
    return new Promise((resolve) => rl.question(question, resolve));
};

// --- QUAN TRỌNG: COPY CẤU HÌNH TỪ FILE database.js SANG ĐÂY ---
const db = mysql.createConnection({
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com', // <--- Thay Host Cloud của em
    port: 4000,
    user: '2RfMS99VErzNfyG.root',                                // <--- Thay User Cloud của em
    password: 'njAb1cZjWXfWrzGZ',                         // <--- Thay Pass Cloud của em
    database: 'QuanLyNhaSach',
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    }
});

const createAdmin = async () => {
    // 1. Khai báo biến bên ngoài để Catch có thể đọc được (SỬA LỖI Ở ĐÂY)
    let username = "";
    let password = "";
    let hoTen = "";

    try {
        console.log("--- TẠO TÀI KHOẢN QUẢN TRỊ VIÊN TRÊN CLOUD ---");
        
        // 2. Nhập liệu
        username = await ask("Nhập Tên đăng nhập (Username): ");
        password = await ask("Nhập Mật khẩu (Password): ");
        hoTen = await ask("Nhập Họ và Tên hiển thị: ");

        if (!username || !password) {
            console.log("❌ Lỗi: Username và Password không được để trống!");
            process.exit(1);
        }

        // 3. Kết nối DB
        // Lưu ý: createConnection của mysql2 thường tự connect khi chạy query, 
        // nhưng ta gọi connect explicit để check lỗi mạng trước.
        db.connect(err => {
            if (err) {
                console.error("❌ Lỗi kết nối Cloud:", err.message);
                process.exit(1);
            }
        });

        // 4. Tạo bảng nếu chưa có
        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS TAI_KHOAN (
                Id INT AUTO_INCREMENT PRIMARY KEY,
                TenDangNhap VARCHAR(50) UNIQUE NOT NULL,
                MatKhau VARCHAR(255) NOT NULL,
                HoTen VARCHAR(100),
                Quyen INT DEFAULT 1
            )
        `);

        // 5. Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 6. Lưu vào DB
        await db.promise().query(
            "INSERT INTO TAI_KHOAN (TenDangNhap, MatKhau, HoTen, Quyen) VALUES (?, ?, ?, ?)",
            [username, hashedPassword, hoTen || 'Admin', 1]
        );

        console.log(`\n✅ Đã tạo thành công tài khoản: ${username}`);
        console.log("👉 Bây giờ bạn có thể dùng tài khoản này để đăng nhập.");

    } catch (error) {
        // Bây giờ 'username' đã được khai báo bên ngoài nên sẽ không bị lỗi ReferenceError nữa
        if (error.code === 'ER_DUP_ENTRY') {
            console.log(`\n⚠️ Lỗi: Tài khoản '${username}' đã tồn tại! (Không cần tạo lại)`);
        } else {
            console.error("\n❌ Lỗi hệ thống:", error);
        }
    } finally {
        rl.close();
        db.end();
    }
};

createAdmin();