const express = require('express');
const router = express.Router();
const { getCustomers, getCustomer, toggleBlock, sendBroadcast, getCustomerStats } = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getCustomers);
router.get('/stats', getCustomerStats);
router.get('/:id', getCustomer);
router.patch('/:id/block', toggleBlock);
router.post('/:id/broadcast', sendBroadcast);

module.exports = router;
