const ReportService = require("../services/reportService");

exports.getInventoryReport = async (req, res) => {
  try {
    const data = await ReportService.getInventoryReport(
      req.query.thang,
      req.query.nam
    );
    res.json(data);
  } catch (e) {
    res.status(500).json(e);
  }
};

exports.getDebtReport = async (req, res) => {
  try {
    const data = await ReportService.getDebtReport(
      req.query.thang,
      req.query.nam
    );
    res.json(data);
  } catch (e) {
    res.status(500).json(e);
  }
};
