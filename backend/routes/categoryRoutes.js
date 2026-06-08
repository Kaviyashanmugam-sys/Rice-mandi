const express = require('express');
const router = express.Router();
const {
  getCategories, createCategory, getCategory,
  updateCategory, deleteCategory, toggleCategory
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getCategories);
router.post('/', protect, createCategory);
router.get('/:id', getCategory);
router.put('/:id', protect, updateCategory);
router.delete('/:id', protect, deleteCategory);
router.patch('/:id/toggle', protect, toggleCategory);

module.exports = router;
