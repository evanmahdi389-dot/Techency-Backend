const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// GET /api/category — all authenticated users
router.get('/', authMiddleware, categoryController.getAll);

// POST /api/category — admin only
router.post('/', authMiddleware, roleMiddleware(['admin']), categoryController.create);

// POST /api/category/:id/subcategory — admin only
router.post('/:id/subcategory', authMiddleware, roleMiddleware(['admin']), categoryController.addSubcategory);

// DELETE /api/category/:id/subcategory — admin only
router.delete('/:id/subcategory', authMiddleware, roleMiddleware(['admin']), categoryController.removeSubcategory);

// DELETE /api/category/:id — admin only
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), categoryController.delete);

// PUT /api/category/:id — admin only
router.put('/:id', authMiddleware, roleMiddleware(['admin']), categoryController.update);

// PUT /api/category/:id/subcategory — admin only
router.put('/:id/subcategory', authMiddleware, roleMiddleware(['admin']), categoryController.updateSubcategory);

module.exports = router;
