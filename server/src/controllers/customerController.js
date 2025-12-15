const CustomerService = require("../services/customerService");

exports.getAll = async (req, res) => {
  try {
    res.json(await CustomerService.getAllCustomers());
  } catch (e) {
    res.status(500).json(e);
  }
};
exports.create = async (req, res) => {
  try {
    await CustomerService.createCustomer(req.body);
    res.json({ message: "Thêm thành công" });
  } catch (e) {
    res.status(500).json(e);
  }
};
exports.update = async (req, res) => {
  try {
    await CustomerService.updateCustomer(req.params.id, req.body);
    res.json({ message: "Thành công" });
  } catch (e) {
    res.status(500).json(e);
  }
};
exports.delete = async (req, res) => {
  try {
    await CustomerService.deleteCustomer(req.params.id);
    res.json({ message: "Thành công" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
