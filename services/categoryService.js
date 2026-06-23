const categoryRepository = require('../repositories/categoryRepository');

class CategoryService {
  async createCategory(name) {
    const existing = await categoryRepository.findByName(name);
    if (existing) {
      const error = new Error('Category already exists');
      error.statusCode = 409;
      throw error;
    }
    return await categoryRepository.create({ name, subcategories: [] });
  }

  async getAllCategories() {
    return await categoryRepository.findAll();
  }

  async addSubcategory(categoryId, subcategory) {
    const category = await categoryRepository.findById(categoryId);
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }
    if (category.subcategories.includes(subcategory)) {
      const error = new Error('Subcategory already exists');
      error.statusCode = 409;
      throw error;
    }
    return await categoryRepository.addSubcategory(categoryId, subcategory);
  }

  async removeSubcategory(categoryId, subcategory) {
    const category = await categoryRepository.findById(categoryId);
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }
    return await categoryRepository.removeSubcategory(categoryId, subcategory);
  }

  async deleteCategory(categoryId) {
    const category = await categoryRepository.findById(categoryId);
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }
    return await categoryRepository.deleteById(categoryId);
  }

  async updateCategory(categoryId, name) {
    const category = await categoryRepository.findById(categoryId);
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }
    const existing = await categoryRepository.findByName(name);
    if (existing && existing._id.toString() !== categoryId) {
      const error = new Error('Category name already exists');
      error.statusCode = 409;
      throw error;
    }
    return await categoryRepository.updateById(categoryId, { name });
  }

  async updateSubcategory(categoryId, oldSubcategory, newSubcategory) {
    const category = await categoryRepository.findById(categoryId);
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }
    if (!category.subcategories.includes(oldSubcategory)) {
      const error = new Error('Old subcategory not found');
      error.statusCode = 404;
      throw error;
    }
    if (category.subcategories.includes(newSubcategory)) {
      const error = new Error('New subcategory already exists');
      error.statusCode = 409;
      throw error;
    }
    return await categoryRepository.updateSubcategory(categoryId, oldSubcategory, newSubcategory);
  }
}

module.exports = new CategoryService();
