const Category = require('../models/Category');

class CategoryRepository {
  async create(data) {
    return await Category.create(data);
  }

  async findAll() {
    return await Category.find().sort({ name: 1 });
  }

  async findById(id) {
    return await Category.findById(id);
  }

  async findByName(name) {
    return await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  }

  async addSubcategory(id, subcategory) {
    return await Category.findByIdAndUpdate(
      id,
      { $addToSet: { subcategories: subcategory } },
      { new: true }
    );
  }

  async removeSubcategory(id, subcategory) {
    return await Category.findByIdAndUpdate(
      id,
      { $pull: { subcategories: subcategory } },
      { new: true }
    );
  }

  async deleteById(id) {
    return await Category.findByIdAndDelete(id);
  }

  async updateById(id, data) {
    return await Category.findByIdAndUpdate(id, data, { new: true });
  }

  async updateSubcategory(id, oldSubcategory, newSubcategory) {
    return await Category.findOneAndUpdate(
      { _id: id, subcategories: oldSubcategory },
      { $set: { 'subcategories.$': newSubcategory } },
      { new: true }
    );
  }
}

module.exports = new CategoryRepository();
