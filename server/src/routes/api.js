const express = require("express");
const router = express.Router();

const Auth = require("../controllers/authController");
const Book = require("../controllers/bookController");
const Cust = require("../controllers/customerController");
const Trans = require("../controllers/transactionController");
const Rep = require("../controllers/reportController");
const Admin = require("../controllers/adminController");

// Auth
router.post("/login", Auth.login);

// Books
router.get("/sach", Book.getAll);
router.post("/sach", Book.create);
router.put("/sach/:id", Book.update);
router.delete("/sach/:id", Book.delete);

// Categories
router.get("/the-loai", Book.getAllCats);
router.post("/the-loai", Book.createCat);
router.put("/the-loai/:id", Book.updateCat);
router.delete("/the-loai/:id", Book.deleteCat);

// Customers
router.get("/khach-hang", Cust.getAll);
router.post("/khach-hang", Cust.create);
router.put("/khach-hang/:id", Cust.update);
router.delete("/khach-hang/:id", Cust.delete);

// Transactions (Nghiệp vụ)
router.post("/nhap-sach", Trans.importBooks);
router.post("/ban-sach", Trans.sellBooks);
router.post("/thu-tien", Trans.collectMoney);

// History & Details
router.get("/lich-su/hoa-don", Trans.getHistoryInvoices);
router.get("/lich-su/nhap-sach", Trans.getHistoryImports);
router.get("/lich-su/phieu-thu", Trans.getHistoryReceipts);
router.get("/chi-tiet-hoa-don/:id", Trans.getDetailInvoice);
router.get("/chi-tiet-phieu-nhap/:id", Trans.getDetailImport);

// Reports
router.get("/bao-cao/ton", Rep.getInventoryReport);
router.get("/bao-cao/cong-no", Rep.getDebtReport);

// Admin & Rules
router.get("/quy-dinh", Admin.getRules);
router.post("/quy-dinh", Admin.updateRules);
router.get("/tai-khoan", Admin.getUsers);
router.post("/tai-khoan", Admin.createUser);
router.delete("/tai-khoan/:id", Admin.deleteUser);

module.exports = router;
