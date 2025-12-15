const { query } = require("../models/baseModel");
const bcrypt = require("bcryptjs");

exports.getAllRules = async () => {
  return await query("SELECT * FROM THAM_SO");
};

exports.updateRules = async (quyDinh) => {
  for (const [k, v] of Object.entries(quyDinh))
    await query("UPDATE THAM_SO SET GiaTri=? WHERE MaThamSo=?", [v, k]);
};

exports.getAllUsers = async () => {
  return await query("SELECT Id, TenDangNhap, HoTen, Quyen FROM TAI_KHOAN");
};

exports.createUser = async (data) => {
  const { tenDangNhap, matKhau, hoTen, quyen } = data;
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(matKhau, salt);
  await query(
    "INSERT INTO TAI_KHOAN (TenDangNhap, MatKhau, HoTen, Quyen) VALUES (?, ?, ?, ?)",
    [tenDangNhap, hash, hoTen, quyen]
  );
};

exports.deleteUser = async (id) => {
  await query("DELETE FROM TAI_KHOAN WHERE Id=?", [id]);
};
