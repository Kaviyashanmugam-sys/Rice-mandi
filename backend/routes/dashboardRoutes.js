// dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { getSummary, getRevenueChart, getTopProducts, getCategorySales } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/summary', getSummary);
router.get('/revenue-chart', getRevenueChart);
router.get('/top-products', getTopProducts);
router.get('/category-sales', getCategorySales);

module.exports = router;
