// server/index.js
const express = require("express");
const cors = require("cors");
const db = require("./database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;
const SECRET_KEY = "doan-tot-nghiep-2024";

app.use(cors());
app.use(express.json());

// --- HELPER ĐỂ CHẠY QUERY THƯỜNG ---
// Dùng cho các API GET đơn giản
async function query(sql, params) {
  const [rows] = await db.promise().query(sql, params);
  return rows;
}

// --- 1. AUTHENTICATION (ĐĂNG NHẬP) ---
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const users = await query("SELECT * FROM TAI_KHOAN WHERE TenDangNhap = ?", [
      username,
    ]);
    if (users.length === 0)
      return res.status(401).json({ error: "Tài khoản không tồn tại!" });

    const isMatch = await bcrypt.compare(password, users[0].MatKhau);
    if (!isMatch)
      return res.status(401).json({ error: "Mật khẩu không đúng!" });

    const token = jwt.sign(
      { id: users[0].Id, role: users[0].Quyen },
      SECRET_KEY,
      { expiresIn: "1d" }
    );
    res.json({
      message: "Login thành công",
      token,
      user: { hoTen: users[0].HoTen, quyen: users[0].Quyen },
    });
  } catch (e) {
    res.status(500).json(e);
  }
});

// --- 2. CÁC API DANH MỤC (GET) ---
app.get("/api/sach", async (req, res) => {
  try {
    res.json(
      await query(
        "SELECT s.*, tl.TenTheLoai FROM SACH s LEFT JOIN THE_LOAI tl ON s.MaTheLoai = tl.MaTheLoai ORDER BY s.MaSach DESC"
      )
    );
  } catch (e) {
    res.status(500).json(e);
  }
});
app.get("/api/khach-hang", async (req, res) => {
  try {
    res.json(await query("SELECT * FROM KHACH_HANG ORDER BY MaKhachHang DESC"));
  } catch (e) {
    res.status(500).json(e);
  }
});
app.get("/api/the-loai", async (req, res) => {
  try {
    res.json(await query("SELECT * FROM THE_LOAI"));
  } catch (e) {
    res.status(500).json(e);
  }
});
app.get("/api/quy-dinh", async (req, res) => {
  try {
    res.json(await query("SELECT * FROM THAM_SO"));
  } catch (e) {
    res.status(500).json(e);
  }
});
app.get("/api/tai-khoan", async (req, res) => {
  try {
    res.json(
      await query("SELECT Id, TenDangNhap, HoTen, Quyen FROM TAI_KHOAN")
    );
  } catch (e) {
    res.status(500).json(e);
  }
});

// --- 3. CÁC API CRUD ĐƠN GIẢN (POST/PUT/DELETE) ---
// Sách
app.post("/api/sach", async (req, res) => {
  const { TenSach, MaTheLoai, TacGia, DonGiaNhapGanNhat } = req.body;
  try {
    await query(
      "INSERT INTO SACH (TenSach, MaTheLoai, TacGia, SoLuongTon, DonGiaNhapGanNhat) VALUES (?, ?, ?, 0, ?)",
      [TenSach, MaTheLoai, TacGia, DonGiaNhapGanNhat || 0]
    );
    res.json({ message: "Thêm sách thành công" });
  } catch (e) {
    res.status(500).json(e);
  }
});
app.put("/api/sach/:id", async (req, res) => {
  const { TenSach, MaTheLoai, TacGia } = req.body;
  try {
    await query(
      "UPDATE SACH SET TenSach=?, MaTheLoai=?, TacGia=? WHERE MaSach=?",
      [TenSach, MaTheLoai, TacGia, req.params.id]
    );
    res.json({ message: "Cập nhật thành công" });
  } catch (e) {
    res.status(500).json(e);
  }
});
app.delete("/api/sach/:id", async (req, res) => {
  try {
    await query("DELETE FROM SACH WHERE MaSach=?", [req.params.id]);
    res.json({ message: "Đã xóa" });
  } catch (e) {
    res.status(400).json({ error: "Không thể xóa sách đã có giao dịch" });
  }
});

// Khách hàng
app.post("/api/khach-hang", async (req, res) => {
  const { hoTen, diaChi, soDienThoai, email } = req.body;
  try {
    await query(
      "INSERT INTO KHACH_HANG (HoTen, DiaChi, SoDienThoai, Email, TienNoHienTai) VALUES (?, ?, ?, ?, 0)",
      [hoTen, diaChi, soDienThoai, email]
    );
    res.json({ message: "Thêm thành công" });
  } catch (e) {
    res.status(500).json(e);
  }
});
app.put("/api/khach-hang/:id", async (req, res) => {
  const { HoTen, DiaChi, SoDienThoai, Email } = req.body;
  try {
    await query(
      "UPDATE KHACH_HANG SET HoTen=?, DiaChi=?, SoDienThoai=?, Email=? WHERE MaKhachHang=?",
      [HoTen, DiaChi, SoDienThoai, Email, req.params.id]
    );
    res.json({ message: "Cập nhật thành công" });
  } catch (e) {
    res.status(500).json(e);
  }
});
app.delete("/api/khach-hang/:id", async (req, res) => {
  try {
    await query("DELETE FROM KHACH_HANG WHERE MaKhachHang=?", [req.params.id]);
    res.json({ message: "Đã xóa" });
  } catch (e) {
    res.status(400).json({ error: "Khách đang có nợ/hóa đơn" });
  }
});

// Thể loại
app.post("/api/the-loai", async (req, res) => {
  try {
    await query("INSERT INTO THE_LOAI (TenTheLoai) VALUES (?)", [
      req.body.tenTheLoai,
    ]);
    res.json({ message: "Thêm thành công" });
  } catch (e) {
    res.status(500).json(e);
  }
});
app.put("/api/the-loai/:id", async (req, res) => {
  try {
    await query("UPDATE THE_LOAI SET TenTheLoai=? WHERE MaTheLoai=?", [
      req.body.tenTheLoai,
      req.params.id,
    ]);
    res.json({ message: "Cập nhật thành công" });
  } catch (e) {
    res.status(500).json(e);
  }
});
app.delete("/api/the-loai/:id", async (req, res) => {
  try {
    await query("DELETE FROM THE_LOAI WHERE MaTheLoai=?", [req.params.id]);
    res.json({ message: "Đã xóa" });
  } catch (e) {
    res.status(400).json({ error: "Thể loại đang có sách" });
  }
});

// User & Quy định
app.post("/api/tai-khoan", async (req, res) => {
  const { tenDangNhap, matKhau, hoTen, quyen } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(matKhau, salt);
    await query(
      "INSERT INTO TAI_KHOAN (TenDangNhap, MatKhau, HoTen, Quyen) VALUES (?, ?, ?, ?)",
      [tenDangNhap, hash, hoTen, quyen]
    );
    res.json({ message: "Tạo thành công" });
  } catch (e) {
    res.status(500).json(e);
  }
});
app.delete("/api/tai-khoan/:id", async (req, res) => {
  try {
    await query("DELETE FROM TAI_KHOAN WHERE Id=?", [req.params.id]);
    res.json({ message: "Đã xóa" });
  } catch (e) {
    res.status(500).json(e);
  }
});
app.post("/api/quy-dinh", async (req, res) => {
  const { quyDinh } = req.body;
  try {
    for (const [k, v] of Object.entries(quyDinh))
      await query("UPDATE THAM_SO SET GiaTri=? WHERE MaThamSo=?", [v, k]);
    res.json({ message: "Cập nhật thành công" });
  } catch (e) {
    res.status(500).json(e);
  }
});

// --- 4. NGHIỆP VỤ PHỨC TẠP (SỬ DỤNG TRANSACTION + ASYNC/AWAIT) ---
// Đây là phần sửa lỗi chính: Dùng connection.promise() xuyên suốt

// 4.1. NHẬP SÁCH
app.post("/api/nhap-sach", async (req, res) => {
  const { danhSachSachNhap } = req.body;
  let tongTien = danhSachSachNhap.reduce((s, i) => s + i.soLuong * i.donGia, 0);

  const conn = db.promise(); // Lấy connection hỗ trợ Promise
  try {
    await conn.beginTransaction(); // Bắt đầu transaction

    // 1. Kiểm tra quy định Nhập (QĐ1) - Kiểm tra từng sách
    const [thamSo] = await conn.query("SELECT * FROM THAM_SO");
    const QD = {};
    thamSo.forEach((r) => (QD[r.MaThamSo] = r.GiaTri));

    for (let item of danhSachSachNhap) {
      // Kiểm tra số lượng nhập tối thiểu
      if (item.soLuong < QD["MinNhap"]) {
        throw new Error(
          `Sách ${item.tenSach || item.maSach}: Số lượng nhập phải >= ${
            QD["MinNhap"]
          }`
        );
      }

      // Kiểm tra tồn kho tối đa trước khi nhập
      const [sachDB] = await conn.query(
        "SELECT SoLuongTon FROM SACH WHERE MaSach = ?",
        [item.maSach]
      );
      if (sachDB.length > 0 && sachDB[0].SoLuongTon > QD["MinTonTruocNhap"]) {
        throw new Error(
          `Sách ${item.tenSach || item.maSach}: Tồn kho (${
            sachDB[0].SoLuongTon
          }) còn nhiều hơn quy định (${
            QD["MinTonTruocNhap"]
          }), không được nhập!`
        );
      }
    }

    // 2. Tạo Phiếu Nhập
    const [resultPhieu] = await conn.query(
      "INSERT INTO PHIEU_NHAP (TongTien) VALUES (?)",
      [tongTien]
    );
    const maPhieu = resultPhieu.insertId;

    // 3. Lưu chi tiết & Cập nhật kho
    for (let item of danhSachSachNhap) {
      const thanhTien = item.soLuong * item.donGia;
      await conn.query(
        "INSERT INTO CT_PHIEU_NHAP (MaPhieuNhap, MaSach, SoLuongNhap, DonGiaNhap, ThanhTien) VALUES (?, ?, ?, ?, ?)",
        [maPhieu, item.maSach, item.soLuong, item.donGia, thanhTien]
      );
      await conn.query(
        "UPDATE SACH SET SoLuongTon = SoLuongTon + ?, DonGiaNhapGanNhat = ? WHERE MaSach = ?",
        [item.soLuong, item.donGia, item.maSach]
      );
    }

    await conn.commit(); // Lưu tất cả
    res.json({ message: "Nhập sách thành công!" });
  } catch (error) {
    await conn.rollback(); // Gặp lỗi thì hủy hết
    // Trả về lỗi chi tiết để Frontend hiển thị
    res.status(400).json({ error: error.message || "Lỗi nhập sách" });
  }
});

// 4.2. BÁN SÁCH
app.post("/api/ban-sach", async (req, res) => {
  const { maKhachHang, danhSachSachBan, soTienTra } = req.body;
  const conn = db.promise();

  try {
    await conn.beginTransaction();

    // Lấy quy định
    const [thamSo] = await conn.query("SELECT * FROM THAM_SO");
    const QD = {};
    thamSo.forEach((r) => (QD[r.MaThamSo] = r.GiaTri));
    const tiLeGia = QD["TiLeGiaBan"] / 100;

    let tongTien = 0;

    // Duyệt tính tiền và kiểm tra tồn kho
    for (let item of danhSachSachBan) {
      // Tính lại giá bán server-side để bảo mật
      const [sachDB] = await conn.query(
        "SELECT SoLuongTon, DonGiaNhapGanNhat FROM SACH WHERE MaSach = ?",
        [item.maSach]
      );
      const giaBan = sachDB[0].DonGiaNhapGanNhat * tiLeGia;
      item.donGiaBan = giaBan;
      item.thanhTien = item.soLuong * giaBan;
      tongTien += item.thanhTien;

      // Kiểm tra tồn kho tối thiểu sau bán (QĐ2)
      if (sachDB[0].SoLuongTon - item.soLuong < QD["MinTonSauBan"]) {
        throw new Error(
          `Sách mã ${item.maSach} vi phạm quy định tồn tối thiểu sau khi bán!`
        );
      }
    }

    const conLai = tongTien - soTienTra;

    // Kiểm tra Nợ (QĐ2)
    const [khach] = await conn.query(
      "SELECT TienNoHienTai FROM KHACH_HANG WHERE MaKhachHang = ?",
      [maKhachHang]
    );
    if (khach[0].TienNoHienTai + conLai > QD["MaxNo"]) {
      throw new Error(
        `Khách nợ quá hạn mức cho phép (${QD["MaxNo"].toLocaleString()}đ)!`
      );
    }

    // Lưu Hóa đơn
    const [hd] = await conn.query(
      "INSERT INTO HOA_DON (MaKhachHang, TongTien, SoTienTra, ConLai) VALUES (?, ?, ?, ?)",
      [maKhachHang, tongTien, soTienTra, conLai]
    );
    const maHoaDon = hd.insertId;

    // Lưu chi tiết & Trừ kho
    for (let item of danhSachSachBan) {
      await conn.query(
        "INSERT INTO CT_HOA_DON (MaHoaDon, MaSach, SoLuong, DonGiaBan, ThanhTien) VALUES (?, ?, ?, ?, ?)",
        [maHoaDon, item.maSach, item.soLuong, item.donGiaBan, item.thanhTien]
      );

      await conn.query(
        "UPDATE SACH SET SoLuongTon = SoLuongTon - ? WHERE MaSach = ?",
        [item.soLuong, item.maSach]
      );
    }

    // Cộng nợ
    if (conLai > 0) {
      await conn.query(
        "UPDATE KHACH_HANG SET TienNoHienTai = TienNoHienTai + ? WHERE MaKhachHang = ?",
        [conLai, maKhachHang]
      );
    }

    await conn.commit();
    res.json({ message: "Bán sách thành công!" });
  } catch (error) {
    await conn.rollback();
    res.status(400).json({ error: error.message });
  }
});

// 4.3. THU TIỀN
app.post("/api/thu-tien", async (req, res) => {
  const { maKhachHang, soTienThu } = req.body;
  const conn = db.promise();

  try {
    await conn.beginTransaction();

    const [qd] = await conn.query(
      "SELECT * FROM THAM_SO WHERE MaThamSo = 'KiemTraThuTien'"
    );
    const [kh] = await conn.query(
      "SELECT TienNoHienTai FROM KHACH_HANG WHERE MaKhachHang = ?",
      [maKhachHang]
    );

    // Kiểm tra quy định thu (QĐ4)
    if (qd[0].GiaTri === 1 && soTienThu > kh[0].TienNoHienTai) {
      throw new Error("Số tiền thu không được vượt quá số tiền khách đang nợ!");
    }

    await conn.query(
      "INSERT INTO PHIEU_THU_TIEN (MaKhachHang, SoTienThu) VALUES (?, ?)",
      [maKhachHang, soTienThu]
    );
    await conn.query(
      "UPDATE KHACH_HANG SET TienNoHienTai = TienNoHienTai - ? WHERE MaKhachHang = ?",
      [soTienThu, maKhachHang]
    );

    await conn.commit();
    res.json({ message: "Thu tiền thành công!" });
  } catch (error) {
    await conn.rollback();
    res.status(400).json({ error: error.message });
  }
});

// --- 5. API LỊCH SỬ & CHI TIẾT ---
app.get("/api/lich-su/hoa-don", async (req, res) => {
  try {
    res.json(
      await query(
        "SELECT hd.*, kh.HoTen FROM HOA_DON hd LEFT JOIN KHACH_HANG kh ON hd.MaKhachHang = kh.MaKhachHang ORDER BY hd.NgayLap DESC"
      )
    );
  } catch (e) {
    res.status(500).json(e);
  }
});
app.get("/api/lich-su/nhap-sach", async (req, res) => {
  try {
    res.json(await query("SELECT * FROM PHIEU_NHAP ORDER BY NgayNhap DESC"));
  } catch (e) {
    res.status(500).json(e);
  }
});
app.get("/api/lich-su/phieu-thu", async (req, res) => {
  try {
    res.json(
      await query(
        "SELECT pt.*, kh.HoTen FROM PHIEU_THU_TIEN pt LEFT JOIN KHACH_HANG kh ON pt.MaKhachHang = kh.MaKhachHang ORDER BY pt.NgayThu DESC"
      )
    );
  } catch (e) {
    res.status(500).json(e);
  }
});
app.get("/api/chi-tiet-hoa-don/:id", async (req, res) => {
  try {
    res.json(
      await query(
        "SELECT ct.*, s.TenSach FROM CT_HOA_DON ct JOIN SACH s ON ct.MaSach = s.MaSach WHERE ct.MaHoaDon = ?",
        [req.params.id]
      )
    );
  } catch (e) {
    res.status(500).json(e);
  }
});
app.get("/api/chi-tiet-phieu-nhap/:id", async (req, res) => {
  try {
    res.json(
      await query(
        "SELECT ct.*, s.TenSach FROM CT_PHIEU_NHAP ct JOIN SACH s ON ct.MaSach = s.MaSach WHERE ct.MaPhieuNhap = ?",
        [req.params.id]
      )
    );
  } catch (e) {
    res.status(500).json(e);
  }
});

// --- 6. API BÁO CÁO (ĐÃ SỬA LỖI 500) ---

// Báo cáo Tồn (Dùng Subquery an toàn hơn)
app.get("/api/bao-cao/ton", async (req, res) => {
  const { thang, nam } = req.query;
  // Cách viết này tránh lỗi Group By và chạy ổn định trên mọi loại SQL
  const sql = `
        SELECT 
            s.MaSach, s.TenSach, s.SoLuongTon as TonCuoi,
            IFNULL((SELECT SUM(SoLuongNhap) FROM CT_PHIEU_NHAP ct JOIN PHIEU_NHAP pn ON ct.MaPhieuNhap = pn.MaPhieuNhap WHERE ct.MaSach = s.MaSach AND MONTH(pn.NgayNhap) = ? AND YEAR(pn.NgayNhap) = ?), 0) as PhatSinhNhap,
            IFNULL((SELECT SUM(SoLuong) FROM CT_HOA_DON ct JOIN HOA_DON hd ON ct.MaHoaDon = hd.MaHoaDon WHERE ct.MaSach = s.MaSach AND MONTH(hd.NgayLap) = ? AND YEAR(hd.NgayLap) = ?), 0) as PhatSinhXuat
        FROM SACH s
    `;
  try {
    const d = await query(sql, [thang, nam, thang, nam]);
    // Tính ngược Tồn Đầu = Cuối - Nhập + Xuất
    res.json(
      d.map((i) => ({
        ...i,
        TonDau: i.TonCuoi - i.PhatSinhNhap + Number(i.PhatSinhXuat),
      }))
    );
  } catch (e) {
    console.error(e); // In lỗi ra terminal server để debug
    res.status(500).json({ error: "Lỗi tính toán báo cáo tồn: " + e.message });
  }
});

// Báo cáo Công Nợ (Tương tự)
app.get("/api/bao-cao/cong-no", async (req, res) => {
  const { thang, nam } = req.query;
  const sql = `
        SELECT 
            kh.MaKhachHang, kh.HoTen, kh.TienNoHienTai as NoCuoi,
            IFNULL((SELECT SUM(ConLai) FROM HOA_DON hd WHERE hd.MaKhachHang = kh.MaKhachHang AND hd.ConLai > 0 AND MONTH(hd.NgayLap) = ? AND YEAR(hd.NgayLap) = ?), 0) as PhatSinhTang,
            IFNULL((SELECT SUM(SoTienThu) FROM PHIEU_THU_TIEN pt WHERE pt.MaKhachHang = kh.MaKhachHang AND MONTH(pt.NgayThu) = ? AND YEAR(pt.NgayThu) = ?), 0) as PhatSinhGiam
        FROM KHACH_HANG kh
    `;
  try {
    const d = await query(sql, [thang, nam, thang, nam]);
    res.json(
      d.map((i) => ({
        ...i,
        NoDau: i.NoCuoi - i.PhatSinhTang + Number(i.PhatSinhGiam),
      }))
    );
  } catch (e) {
    res.status(500).json({ error: "Lỗi báo cáo công nợ: " + e.message });
  }
});

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
