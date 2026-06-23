const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userManagementService = require('../services/userManagementService');
const responseHandler = require('../utils/responseHandler');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/register — admin only creates users
router.post(
  '/register',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req, res, next) => {
    try {
      const user = await userManagementService.createUser(req.body);
      responseHandler(res, 201, 'User registered successfully', {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  responseHandler(res, 200, 'User profile', req.user);
});

module.exports = router;
