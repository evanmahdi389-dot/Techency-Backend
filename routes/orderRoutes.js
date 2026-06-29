const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Creation & Reading
router.post('/', orderController.createOrder); // Sales Post
router.get('/', orderController.getOrders);
router.get('/metrics', orderController.getMetrics);

// State Transition Routes
router.put('/:id/approve-order', orderController.approveOrder);
router.put('/:id/submit-script', orderController.submitScript);
router.put('/:id/approve-script', orderController.approveScript);
router.put('/:id/update-shoot', orderController.updateShoot);
router.put('/:id/submit-draft', orderController.submitDraft);
router.put('/:id/process-review', orderController.processReview);
router.put('/:id/complete-order', orderController.completeOrder);

module.exports = router;
