const { query } = require("../models/baseModel");

exports.getAllBooks = async () => {
  return await query(
    "SELECT s.*, tl.TenTheLoai FROM SACH s LEFT JOIN THE_LOAI tl ON s.MaTheLoai = tl.MaTheLoai ORDER BY s.MaSach ASC"
  );
};

exports.getAllCategories = async () => {
  return await query("SELECT * FROM THE_LOAI");
};

exports.createBook = async (data) => {
  const { TenSach, MaTheLoai, TacGia, DonGiaNhapGanNhat } = data;
  await query(
    "INSERT INTO SACH (TenSach, MaTheLoai, TacGia, SoLuongTon, DonGiaNhapGanNhat) VALUES (?, ?, ?, 0, ?)",
    [TenSach, MaTheLoai, TacGia, DonGiaNhapGanNhat || 0]
  );
};

exports.updateBook = async (id, data) => {
  const { TenSach, MaTheLoai, TacGia } = data;
  await query(
    "UPDATE SACH SET TenSach=?, MaTheLoai=?, TacGia=? WHERE MaSach=?",
    [TenSach, MaTheLoai, TacGia, id]
  );
};

exports.deleteBook = async (id) => {
  try {
    await query("DELETE FROM SACH WHERE MaSach=?", [id]);
  } catch (e) {
    throw new Error("Không thể xóa sách đã có giao dịch");
  }
};

// Category Logic
exports.createCategory = async (name) => {
  await query("INSERT INTO THE_LOAI (TenTheLoai) VALUES (?)", [name]);
};

exports.updateCategory = async (id, name) => {
  await query("UPDATE THE_LOAI SET TenTheLoai=? WHERE MaTheLoai=?", [name, id]);
};

exports.deleteCategory = async (id) => {
  try {
    await query("DELETE FROM THE_LOAI WHERE MaTheLoai=?", [id]);
  } catch (e) {
    throw new Error("Thể loại đang có sách, không thể xóa");
  }
};
