const User = require('../models/User');

class UserManagementRepository {
  async findAll(filter = {}) {
    return await User.find(filter).select('-password').sort({ createdAt: -1 });
  }

  async findById(id) {
    return await User.findById(id).select('-password');
  }

  async create(data) {
    return await User.create(data);
  }

  async updateById(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
  }

  async deleteById(id) {
    return await User.findByIdAndDelete(id);
  }

  async countByRole() {
    return await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
  }
}

module.exports = new UserManagementRepository();
