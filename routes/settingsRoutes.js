const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

// Dynamic Settings Routes
router.get('/dynamic', settingsController.getDynamicSettings);
router.put('/dynamic', settingsController.updateDynamicSettings);

// Model Directory Routes
router.get('/models', settingsController.getModels);
router.post('/models', settingsController.createModel);
router.delete('/models/:id', settingsController.deleteModel);

module.exports = router;
