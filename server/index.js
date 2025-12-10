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

app.get("/", (req, res) => {
  res.send(
    "✅ Server Quản Lý Nhà Sách đang chạy ổn định (Mode: Connection Pool)!"
  );
});

// --- HELPER CHO QUERY THƯỜNG ---
// Pool tự động lấy kết nối và thực thi
async function query(sql, params) {
  const [rows] = await db.promise().query(sql, params);
  return rows;
}

// --- 1. AUTH ---
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

// --- 2. API GET ---
app.get("/api/sach", async (req, res) => {
  try {
    res.json(
      await query(
        "SELECT s.*, tl.TenTheLoai FROM SACH s LEFT JOIN THE_LOAI tl ON s.MaTheLoai = tl.MaTheLoai ORDER BY s.MaSach ASC"
      )
    );
  } catch (e) {
    res.status(500).json(e);
  }
});
app.get("/api/khach-hang", async (req, res) => {
  try {
    res.json(await query("SELECT * FROM KHACH_HANG ORDER BY MaKhachHang ASC"));
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

// --- 3. API CRUD ĐƠN GIẢN ---
app.post("/api/sach", async (req, res) => {
  const { TenSach, MaTheLoai, TacGia, DonGiaNhapGanNhat } = req.body;
  try {
    await query(
      "INSERT INTO SACH (TenSach, MaTheLoai, TacGia, SoLuongTon, DonGiaNhapGanNhat) VALUES (?, ?, ?, 0, ?)",
      [TenSach, MaTheLoai, TacGia, DonGiaNhapGanNhat || 0]
    );
    res.json({ message: "Thành công" });
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
    res.json({ message: "Thành công" });
  } catch (e) {
    res.status(500).json(e);
  }
});
app.delete("/api/sach/:id", async (req, res) => {
  try {
    await query("DELETE FROM SACH WHERE MaSach=?", [req.params.id]);
    res.json({ message: "Thành công" });
  } catch (e) {
    res.status(400).json({ error: "Không thể xóa sách đã có giao dịch" });
  }
});

app.post("/api/khach-hang", async (req, res) => {
  const { HoTen, DiaChi, SoDienThoai, Email } = req.body;
  try {
    await query(
      "INSERT INTO KHACH_HANG (HoTen, DiaChi, SoDienThoai, Email, TienNoHienTai) VALUES (?, ?, ?, ?, 0)",
      [HoTen, DiaChi, SoDienThoai, Email]
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
    res.json({ message: "Thành công" });
  } catch (e) {
    res.status(500).json(e);
  }
});
app.delete("/api/khach-hang/:id", async (req, res) => {
  try {
    await query("DELETE FROM KHACH_HANG WHERE MaKhachHang=?", [req.params.id]);
    res.json({ message: "Thành công" });
  } catch (e) {
    res.status(400).json({ error: "Khách đang có nợ" });
  }
});

app.post("/api/the-loai", async (req, res) => {
  try {
    await query("INSERT INTO THE_LOAI (TenTheLoai) VALUES (?)", [
      req.body.tenTheLoai,
    ]);
    res.json({ message: "Thành công" });
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
    res.json({ message: "Thành công" });
  } catch (e) {
    res.status(500).json(e);
  }
});
app.delete("/api/the-loai/:id", async (req, res) => {
  try {
    await query("DELETE FROM THE_LOAI WHERE MaTheLoai=?", [req.params.id]);
    res.json({ message: "Thành công" });
  } catch (e) {
    res.status(400).json({ error: "Thể loại có sách" });
  }
});

app.post("/api/tai-khoan", async (req, res) => {
  const { tenDangNhap, matKhau, hoTen, quyen } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(matKhau, salt);
    await query(
      "INSERT INTO TAI_KHOAN (TenDangNhap, MatKhau, HoTen, Quyen) VALUES (?, ?, ?, ?)",
      [tenDangNhap, hash, hoTen, quyen]
    );
    res.json({ message: "Thành công" });
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

// --- 4. NGHIỆP VỤ PHỨC TẠP (POOL TRANSACTION) ---
// QUAN TRỌNG: Phải dùng db.promise().getConnection()

// 4.1. NHẬP SÁCH
app.post("/api/nhap-sach", async (req, res) => {
  const { danhSachSachNhap } = req.body;
  let tongTien = danhSachSachNhap.reduce((s, i) => s + i.soLuong * i.donGia, 0);

  let conn;
  try {
    conn = await db.promise().getConnection(); // Mượn kết nối
    await conn.beginTransaction();

    const [thamSo] = await conn.query("SELECT * FROM THAM_SO");
    const QD = {};
    thamSo.forEach((r) => (QD[r.MaThamSo] = r.GiaTri));

    for (let item of danhSachSachNhap) {
      if (item.soLuong < QD["MinNhap"])
        throw new Error(`Sách ${item.tenSach}: Nhập < ${QD["MinNhap"]}`);
      const [sachDB] = await conn.query(
        "SELECT SoLuongTon FROM SACH WHERE MaSach = ?",
        [item.maSach]
      );
      if (sachDB[0].SoLuongTon > QD["MinTonTruocNhap"])
        throw new Error(
          `Sách ${item.tenSach}: Tồn > ${QD["MinTonTruocNhap"]}, không được nhập`
        );
    }

    const [r] = await conn.query(
      "INSERT INTO PHIEU_NHAP (TongTien) VALUES (?)",
      [tongTien]
    );
    const maPhieu = r.insertId;

    for (let item of danhSachSachNhap) {
      const tt = item.soLuong * item.donGia;
      await conn.query(
        "INSERT INTO CT_PHIEU_NHAP (MaPhieuNhap, MaSach, SoLuongNhap, DonGiaNhap, ThanhTien) VALUES (?, ?, ?, ?, ?)",
        [maPhieu, item.maSach, item.soLuong, item.donGia, tt]
      );
      await conn.query(
        "UPDATE SACH SET SoLuongTon = SoLuongTon + ?, DonGiaNhapGanNhat = ? WHERE MaSach = ?",
        [item.soLuong, item.donGia, item.maSach]
      );
    }

    await conn.commit();
    res.json({ message: "Nhập thành công" });
  } catch (e) {
    if (conn) await conn.rollback();
    res.status(400).json({ error: e.message });
  } finally {
    if (conn) conn.release(); // Trả kết nối
  }
});

// 4.2. BÁN SÁCH
app.post("/api/ban-sach", async (req, res) => {
  const { maKhachHang, danhSachSachBan, soTienTra } = req.body;
  let conn;
  try {
    conn = await db.promise().getConnection();
    await conn.beginTransaction();

    // 1. Lấy tham số quy định
    const [thamSo] = await conn.query("SELECT * FROM THAM_SO");
    const QD = {};
    thamSo.forEach((r) => (QD[r.MaThamSo] = r.GiaTri));
    const tiLeGia = QD["TiLeGiaBan"] / 100;
    const isCheckThuTien = QD["KiemTraThuTien"] === 1;

    // 2. Tính tổng tiền hóa đơn & Kiểm tra tồn kho
    let tongTienHoaDon = 0;
    for (let item of danhSachSachBan) {
      const [sachDB] = await conn.query(
        "SELECT SoLuongTon, DonGiaNhapGanNhat, TenSach FROM SACH WHERE MaSach = ?",
        [item.maSach]
      );
      if (sachDB.length === 0)
        throw new Error(`Sách ID ${item.maSach} không tồn tại`);

      const giaBan = sachDB[0].DonGiaNhapGanNhat * tiLeGia;
      item.donGiaBan = giaBan;
      item.thanhTien = item.soLuong * giaBan;
      tongTienHoaDon += item.thanhTien;

      // Check QĐ2: Tồn tối thiểu sau bán
      if (sachDB[0].SoLuongTon - item.soLuong < QD["MinTonSauBan"]) {
        throw new Error(
          `Sách "${sachDB[0].TenSach}" vi phạm quy định tồn tối thiểu (${QD["MinTonSauBan"]}) sau khi bán!`
        );
      }
    }

    // 3. Phân bổ tiền trả (Hóa đơn & Nợ cũ)
    let tienTraChoHoaDon = 0;
    let tienThuNoCu = 0; // Tiền dư ra để lập phiếu thu
    let noPhatSinh = 0;

    if (soTienTra >= tongTienHoaDon) {
      // Khách trả đủ hoặc dư
      tienTraChoHoaDon = tongTienHoaDon;
      tienThuNoCu = soTienTra - tongTienHoaDon; // Phần dư
      noPhatSinh = 0;
    } else {
      // Khách trả thiếu (Nợ thêm)
      tienTraChoHoaDon = soTienTra;
      tienThuNoCu = 0;
      noPhatSinh = tongTienHoaDon - soTienTra;
    }

    // 4. Lấy thông tin khách hàng hiện tại
    const [khach] = await conn.query(
      "SELECT TienNoHienTai FROM KHACH_HANG WHERE MaKhachHang = ?",
      [maKhachHang]
    );
    const noHienTai = khach[0].TienNoHienTai;

    // 5. Kiểm tra các Quy định về Tiền

    // QĐ4: Nếu có thu nợ cũ (tiền dư), số tiền này không được vượt quá Nợ Hiện Tại
    if (tienThuNoCu > 0 && isCheckThuTien && tienThuNoCu > noHienTai) {
      throw new Error(
        `Khách trả thừa ${tienThuNoCu.toLocaleString()}đ, nhưng nợ cũ chỉ có ${noHienTai.toLocaleString()}đ. Không thể thu quá số nợ!`
      );
    }

    // QĐ2: Kiểm tra tổng nợ sau giao dịch (Nợ cũ - Thu nợ + Nợ mới)
    const noSauGiaoDich = noHienTai - tienThuNoCu + noPhatSinh;
    if (noSauGiaoDich > QD["MaxNo"]) {
      throw new Error(
        `Giao dịch khiến tổng nợ khách hàng (${noSauGiaoDich.toLocaleString()}đ) vượt quá hạn mức (${QD[
          "MaxNo"
        ].toLocaleString()}đ)!`
      );
    }

    // --- BẮT ĐẦU GHI DỮ LIỆU ---

    // B1: Lưu Hóa Đơn
    const [hd] = await conn.query(
      "INSERT INTO HOA_DON (MaKhachHang, TongTien, SoTienTra, ConLai) VALUES (?, ?, ?, ?)",
      [maKhachHang, tongTienHoaDon, tienTraChoHoaDon, noPhatSinh]
    );
    const maHoaDon = hd.insertId;

    // B2: Lưu Chi tiết Hóa đơn & Trừ kho
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

    // B3: Tự động Lập Phiếu Thu (Nếu có tiền dư)
    if (tienThuNoCu > 0) {
      await conn.query(
        "INSERT INTO PHIEU_THU_TIEN (MaKhachHang, SoTienThu) VALUES (?, ?)",
        [maKhachHang, tienThuNoCu]
      );
    }

    // B4: Cập nhật Nợ Khách Hàng (Công thức chuẩn: Nợ Mới = Nợ Cũ - Thu Nợ Dư + Nợ Phát Sinh Hóa Đơn)
    // (Hoặc đơn giản là: Nợ Mới = Nợ Cũ + Tổng Tiền Hóa Đơn - Tổng Tiền Khách Đưa)
    if (tienThuNoCu > 0 || noPhatSinh > 0) {
      const thayDoiNo = noPhatSinh - tienThuNoCu; // Có thể âm (nếu trả nợ) hoặc dương (nếu nợ thêm)
      await conn.query(
        "UPDATE KHACH_HANG SET TienNoHienTai = TienNoHienTai + ? WHERE MaKhachHang = ?",
        [thayDoiNo, maKhachHang]
      );
    }

    await conn.commit();

    // Trả về message chi tiết để hiển thị
    let msg = "Bán hàng thành công!";
    if (tienThuNoCu > 0)
      msg += ` Đã tự động lập phiếu thu nợ ${tienThuNoCu.toLocaleString()}đ.`;

    res.json({ message: msg });
  } catch (error) {
    if (conn) await conn.rollback();
    res.status(400).json({ error: error.message });
  } finally {
    if (conn) conn.release();
  }
});

// 4.3. THU TIỀN
app.post("/api/thu-tien", async (req, res) => {
  const { maKhachHang, soTienThu } = req.body;
  let conn;
  try {
    conn = await db.promise().getConnection();
    await conn.beginTransaction();

    const [qd] = await conn.query(
      "SELECT * FROM THAM_SO WHERE MaThamSo = 'KiemTraThuTien'"
    );
    const [kh] = await conn.query(
      "SELECT TienNoHienTai FROM KHACH_HANG WHERE MaKhachHang = ?",
      [maKhachHang]
    );

    if (qd[0].GiaTri === 1 && soTienThu > kh[0].TienNoHienTai)
      throw new Error("Tiền thu > Nợ!");

    await conn.query(
      "INSERT INTO PHIEU_THU_TIEN (MaKhachHang, SoTienThu) VALUES (?, ?)",
      [maKhachHang, soTienThu]
    );
    await conn.query(
      "UPDATE KHACH_HANG SET TienNoHienTai = TienNoHienTai - ? WHERE MaKhachHang = ?",
      [soTienThu, maKhachHang]
    );

    await conn.commit();
    res.json({ message: "Thu thành công" });
  } catch (e) {
    if (conn) await conn.rollback();
    res.status(400).json({ error: e.message });
  } finally {
    if (conn) conn.release();
  }
});

// --- 5. LỊCH SỬ & BÁO CÁO ---
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

app.get("/api/bao-cao/ton", async (req, res) => {
  const { thang, nam } = req.query;
  const sql = `SELECT s.MaSach, s.TenSach, s.SoLuongTon as TonCuoi, IFNULL((SELECT SUM(SoLuongNhap) FROM CT_PHIEU_NHAP ct JOIN PHIEU_NHAP pn ON ct.MaPhieuNhap = pn.MaPhieuNhap WHERE ct.MaSach = s.MaSach AND MONTH(pn.NgayNhap) = ? AND YEAR(pn.NgayNhap) = ?), 0) as PhatSinhNhap, IFNULL((SELECT SUM(SoLuong) FROM CT_HOA_DON ct JOIN HOA_DON hd ON ct.MaHoaDon = hd.MaHoaDon WHERE ct.MaSach = s.MaSach AND MONTH(hd.NgayLap) = ? AND YEAR(hd.NgayLap) = ?), 0) as PhatSinhXuat FROM SACH s`;
  try {
    const d = await query(sql, [thang, nam, thang, nam]);
    res.json(
      d.map((i) => ({
        ...i,
        TonDau: i.TonCuoi - i.PhatSinhNhap + Number(i.PhatSinhXuat),
      }))
    );
  } catch (e) {
    res.status(500).json(e);
  }
});

app.get("/api/bao-cao/cong-no", async (req, res) => {
  const { thang, nam } = req.query;
  const sql = `SELECT kh.MaKhachHang, kh.HoTen, kh.TienNoHienTai as NoCuoi, IFNULL((SELECT SUM(ConLai) FROM HOA_DON hd WHERE hd.MaKhachHang = kh.MaKhachHang AND hd.ConLai > 0 AND MONTH(hd.NgayLap) = ? AND YEAR(hd.NgayLap) = ?), 0) as PhatSinhTang, IFNULL((SELECT SUM(SoTienThu) FROM PHIEU_THU_TIEN pt WHERE pt.MaKhachHang = kh.MaKhachHang AND MONTH(pt.NgayThu) = ? AND YEAR(pt.NgayThu) = ?), 0) as PhatSinhGiam FROM KHACH_HANG kh`;
  try {
    const d = await query(sql, [thang, nam, thang, nam]);
    res.json(
      d.map((i) => ({
        ...i,
        NoDau: i.NoCuoi - i.PhatSinhTang + Number(i.PhatSinhGiam),
      }))
    );
  } catch (e) {
    res.status(500).json(e);
  }
});

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
