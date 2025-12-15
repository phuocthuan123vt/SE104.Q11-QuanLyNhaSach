const AuthService = require("../services/authService");

exports.login = async (req, res) => {
  try {
    const result = await AuthService.login(
      req.body.username,
      req.body.password
    );
    res.json(result);
  } catch (e) {
    res.status(401).json({ error: e.message }); // 401 Unauthorized
  }
};
