const categoryService = require('../services/categoryService');
const responseHandler = require('../utils/responseHandler');

class CategoryController {
  async create(req, res, next) {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });
      const category = await categoryService.createCategory(name);
      responseHandler(res, 201, 'Category created successfully', category);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const categories = await categoryService.getAllCategories();
      responseHandler(res, 200, 'Categories retrieved successfully', categories);
    } catch (error) {
      next(error);
    }
  }

  async addSubcategory(req, res, next) {
    try {
      const { subcategory } = req.body;
      if (!subcategory) return res.status(400).json({ success: false, message: 'Subcategory name is required' });
      const category = await categoryService.addSubcategory(req.params.id, subcategory);
      responseHandler(res, 200, 'Subcategory added successfully', category);
    } catch (error) {
      next(error);
    }
  }

  async removeSubcategory(req, res, next) {
    try {
      const { subcategory } = req.body;
      const category = await categoryService.removeSubcategory(req.params.id, subcategory);
      responseHandler(res, 200, 'Subcategory removed successfully', category);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await categoryService.deleteCategory(req.params.id);
      responseHandler(res, 200, 'Category deleted successfully', null);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });
      const category = await categoryService.updateCategory(req.params.id, name);
      responseHandler(res, 200, 'Category updated successfully', category);
    } catch (error) {
      next(error);
    }
  }

  async updateSubcategory(req, res, next) {
    try {
      const { oldSubcategory, newSubcategory } = req.body;
      if (!oldSubcategory || !newSubcategory) {
        return res.status(400).json({ success: false, message: 'oldSubcategory and newSubcategory are required' });
      }
      const category = await categoryService.updateSubcategory(req.params.id, oldSubcategory, newSubcategory);
      responseHandler(res, 200, 'Subcategory updated successfully', category);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
