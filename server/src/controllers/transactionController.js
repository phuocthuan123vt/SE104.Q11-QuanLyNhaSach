const TransactionService = require("../services/transactionService");

exports.importBooks = async (req, res) => {
  try {
    const r = await TransactionService.importBooks(req.body.danhSachSachNhap);
    res.json(r);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.sellBooks = async (req, res) => {
  try {
    const { maKhachHang, danhSachSachBan, soTienTra } = req.body;
    const r = await TransactionService.sellBooks(
      maKhachHang,
      danhSachSachBan,
      soTienTra
    );
    res.json(r);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.collectMoney = async (req, res) => {
  try {
    const r = await TransactionService.collectMoney(
      req.body.maKhachHang,
      req.body.soTienThu
    );
    res.json(r);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// History
exports.getHistoryInvoices = async (req, res) => {
  try {
    res.json(await TransactionService.getHistoryInvoices());
  } catch (e) {
    res.status(500).json(e);
  }
};
exports.getHistoryImports = async (req, res) => {
  try {
    res.json(await TransactionService.getHistoryImports());
  } catch (e) {
    res.status(500).json(e);
  }
};
exports.getHistoryReceipts = async (req, res) => {
  try {
    res.json(await TransactionService.getHistoryReceipts());
  } catch (e) {
    res.status(500).json(e);
  }
};
exports.getDetailInvoice = async (req, res) => {
  try {
    res.json(await TransactionService.getDetailInvoice(req.params.id));
  } catch (e) {
    res.status(500).json(e);
  }
};
exports.getDetailImport = async (req, res) => {
  try {
    res.json(await TransactionService.getDetailImport(req.params.id));
  } catch (e) {
    res.status(500).json(e);
  }
};
