const userManagementService = require('../services/userManagementService');
const responseHandler = require('../utils/responseHandler');

class UserController {
  async getAll(req, res, next) {
    try {
      const { role } = req.query;
      const filter = role ? { role } : {};
      const users = await userManagementService.getAllUsers(filter);
      responseHandler(res, 200, 'Users retrieved successfully', users);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const user = await userManagementService.createUser(req.body);
      responseHandler(res, 201, 'User created successfully', {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const user = await userManagementService.updateUser(req.params.id, req.body);
      responseHandler(res, 200, 'User updated successfully', user);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await userManagementService.deleteUser(req.params.id, req.user._id);
      responseHandler(res, 200, 'User deleted successfully', null);
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await userManagementService.getUserStats();
      responseHandler(res, 200, 'User stats retrieved', stats);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
