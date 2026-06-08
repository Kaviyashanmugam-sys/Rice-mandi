// authRoutes.js
const express = require('express');
const router = express.Router();
const { login, getMe, changePassword, register } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);
router.post('/register', protect, adminOnly, register);

module.exports = router;
