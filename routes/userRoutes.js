const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// Allow fetching users (e.g., models) for authenticated users
router.get('/', userController.getAll);

// All user management routes - admin only
router.use(roleMiddleware(['admin']));

router.get('/stats', userController.getStats);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);

module.exports = router;
