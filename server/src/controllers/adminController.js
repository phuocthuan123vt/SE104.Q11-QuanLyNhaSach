const AdminService = require("../services/adminService");

exports.getRules = async (req, res) => {
  try {
    res.json(await AdminService.getAllRules());
  } catch (e) {
    res.status(500).json(e);
  }
};
exports.updateRules = async (req, res) => {
  try {
    await AdminService.updateRules(req.body.quyDinh);
    res.json({ message: "Cập nhật thành công" });
  } catch (e) {
    res.status(500).json(e);
  }
};

exports.getUsers = async (req, res) => {
  try {
    res.json(await AdminService.getAllUsers());
  } catch (e) {
    res.status(500).json(e);
  }
};
exports.createUser = async (req, res) => {
  try {
    await AdminService.createUser(req.body);
    res.json({ message: "Thành công" });
  } catch (e) {
    res.status(500).json(e);
  }
};
exports.deleteUser = async (req, res) => {
  try {
    await AdminService.deleteUser(req.params.id);
    res.json({ message: "Đã xóa" });
  } catch (e) {
    res.status(500).json(e);
  }
};
