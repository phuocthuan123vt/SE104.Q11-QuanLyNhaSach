const { query } = require("../models/baseModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "doan-tot-nghiep-2024";

exports.login = async (username, password) => {
  const users = await query("SELECT * FROM TAI_KHOAN WHERE TenDangNhap = ?", [
    username,
  ]);
  if (users.length === 0) throw new Error("Tài khoản không tồn tại!");

  const isMatch = await bcrypt.compare(password, users[0].MatKhau);
  if (!isMatch) throw new Error("Mật khẩu không đúng!");

  const token = jwt.sign(
    { id: users[0].Id, role: users[0].Quyen },
    SECRET_KEY,
    { expiresIn: "1d" }
  );

  return {
    message: "Login thành công",
    token,
    user: { hoTen: users[0].HoTen, quyen: users[0].Quyen },
  };
};
