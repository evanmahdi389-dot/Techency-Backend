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

  async updateProfile(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (password) updateData.password = password;

      if (req.file) {
        const { uploadToCloudinary } = require('../middleware/uploadMiddleware');
        const result = await uploadToCloudinary(req.file);
        updateData.profileImage = result.secure_url;
      }

      const updatedUser = await authService.updateProfile(req.user.id, updateData);
      
      // Keep the response structure consistent. We can send a new token if we want, but typically updating profile doesn't strictly require a new token unless the token payload changes and needs refresh.
      responseHandler(res, 200, 'Profile updated successfully', updatedUser);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
