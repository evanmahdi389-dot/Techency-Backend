const authService = require('../services/authService');
const responseHandler = require('../utils/responseHandler');

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      responseHandler(res, 200, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
