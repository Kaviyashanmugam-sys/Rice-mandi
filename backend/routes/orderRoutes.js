// orderRoutes.js
const express = require('express');
const router = express.Router();
const { getOrders, getOrder, updateOrderStatus, updatePaymentStatus, getOrderStats } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getOrders);
router.get('/stats/summary', getOrderStats);
router.get('/:id', getOrder);
router.patch('/:id/status', updateOrderStatus);
router.patch('/:id/payment', updatePaymentStatus);

module.exports = router;
