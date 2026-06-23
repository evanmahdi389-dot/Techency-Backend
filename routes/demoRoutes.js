const express = require('express');
const router = express.Router();
const demoController = require('../controllers/demoController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// POST /api/demo/create — sales + admin
router.post('/create', authMiddleware, roleMiddleware(['sales', 'admin']), demoController.create);

// GET /api/demo/all — admin only
router.get('/all', authMiddleware, roleMiddleware(['admin']), demoController.getAll);

// GET /api/demo/my — sales can see their own
router.get('/my', authMiddleware, roleMiddleware(['sales', 'admin']), demoController.getMyLinks);

// DELETE /api/demo/:id — admin or creator
router.delete('/:id', authMiddleware, roleMiddleware(['sales', 'admin']), demoController.delete);

// GET /api/demo/:id — public (no auth) — must be LAST
router.get('/:id', demoController.getById);

module.exports = router;
