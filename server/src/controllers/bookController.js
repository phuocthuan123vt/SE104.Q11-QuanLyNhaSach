const BookService = require("../services/bookService");

exports.getAll = async (req, res) => {
  try {
    res.json(await BookService.getAllBooks());
  } catch (e) {
    res.status(500).json(e);
  }
};
exports.create = async (req, res) => {
  try {
    await BookService.createBook(req.body);
    res.json({ message: "Thành công" });
  } catch (e) {
    res.status(500).json(e);
  }
};
exports.update = async (req, res) => {
  try {
    await BookService.updateBook(req.params.id, req.body);
    res.json({ message: "Thành công" });
  } catch (e) {
    res.status(500).json(e);
  }
};
exports.delete = async (req, res) => {
  try {
    await BookService.deleteBook(req.params.id);
    res.json({ message: "Thành công" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// Categories
exports.getAllCats = async (req, res) => {
  try {
    res.json(await BookService.getAllCategories());
  } catch (e) {
    res.status(500).json(e);
  }
};
exports.createCat = async (req, res) => {
  try {
    await BookService.createCategory(req.body.tenTheLoai);
    res.json({ message: "Thành công" });
  } catch (e) {
    res.status(500).json(e);
  }
};
exports.updateCat = async (req, res) => {
  try {
    await BookService.updateCategory(req.params.id, req.body.tenTheLoai);
    res.json({ message: "Thành công" });
  } catch (e) {
    res.status(500).json(e);
  }
};
exports.deleteCat = async (req, res) => {
  try {
    await BookService.deleteCategory(req.params.id);
    res.json({ message: "Thành công" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
