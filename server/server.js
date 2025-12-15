const express = require("express");
const cors = require("cors");
const apiRoutes = require("./src/routes/api");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes chính
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.send("✅ Server Quản Lý Nhà Sách đang chạy (MVC Architecture)!");
});

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
