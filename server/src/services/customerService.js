const { query } = require("../models/baseModel");

exports.getAllCustomers = async () => {
  return await query("SELECT * FROM KHACH_HANG ORDER BY MaKhachHang ASC");
};

exports.createCustomer = async (data) => {
  const { HoTen, DiaChi, SoDienThoai, Email } = data;
  await query(
    "INSERT INTO KHACH_HANG (HoTen, DiaChi, SoDienThoai, Email, TienNoHienTai) VALUES (?, ?, ?, ?, 0)",
    [HoTen, DiaChi, SoDienThoai, Email]
  );
};

exports.updateCustomer = async (id, data) => {
  const { HoTen, DiaChi, SoDienThoai, Email } = data;
  await query(
    "UPDATE KHACH_HANG SET HoTen=?, DiaChi=?, SoDienThoai=?, Email=? WHERE MaKhachHang=?",
    [HoTen, DiaChi, SoDienThoai, Email, id]
  );
};

exports.deleteCustomer = async (id) => {
  try {
    await query("DELETE FROM KHACH_HANG WHERE MaKhachHang=?", [id]);
  } catch (e) {
    throw new Error("Khách đang có nợ hoặc lịch sử giao dịch");
  }
};
