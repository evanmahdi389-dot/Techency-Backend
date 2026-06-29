const userManagementRepository = require('../repositories/userManagementRepository');
const bcrypt = require('bcryptjs');

class UserManagementService {
  async getAllUsers(filter = {}) {
    return await userManagementRepository.findAll(filter);
  }

  async createUser(data) {
    const { name, email, password, role } = data;

    const DynamicSetting = require('../models/DynamicSetting');
    let settings = await DynamicSetting.findOne();
    const validRoles = settings ? settings.roles : ['admin', 'editor', 'sales', 'pm', 'writer'];

    if (!validRoles.includes(role)) {
      const error = new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    return await userManagementRepository.create({ name, email, password, role });
  }

  async updateUser(userId, updateData) {
    const user = await userManagementRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const allowedFields = {};
    if (updateData.name) allowedFields.name = updateData.name;
    if (updateData.role) allowedFields.role = updateData.role;
    if (updateData.email) allowedFields.email = updateData.email;
    if (updateData.password) {
      allowedFields.password = await bcrypt.hash(updateData.password, 10);
    }

    return await userManagementRepository.updateById(userId, allowedFields);
  }

  async deleteUser(userId, requestingUserId) {
    if (userId === requestingUserId.toString()) {
      const error = new Error('You cannot delete your own account');
      error.statusCode = 400;
      throw error;
    }

    const user = await userManagementRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return await userManagementRepository.deleteById(userId);
  }

  async getUserStats() {
    return await userManagementRepository.countByRole();
  }
}

module.exports = new UserManagementService();
