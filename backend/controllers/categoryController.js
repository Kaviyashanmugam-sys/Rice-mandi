const Category = require('../models/Category');
const Product = require('../models/Product');

// GET /api/categories
const getCategories = async (req, res) => {
  try {
    const { activeOnly } = req.query;
    const filter = activeOnly === 'true' ? { isActive: true } : {};
    const categories = await Category.find(filter)
      .populate('productCount')
      .sort({ sortOrder: 1, name: 1 });
    res.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/categories
const createCategory = async (req, res) => {
  try {
    const { name, nameInTamil, description, icon, sortOrder } = req.body;
    const category = await Category.create({ name, nameInTamil, description, icon, sortOrder });
    res.status(201).json({ success: true, message: 'Category created', data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/categories/:id
const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('productCount');
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/categories/:id
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category updated', data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  try {
    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete. ${productCount} product(s) are in this category.`
      });
    }
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/categories/:id/toggle
const toggleCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    category.isActive = !category.isActive;
    await category.save();
    res.json({ success: true, message: `Category ${category.isActive ? 'activated' : 'deactivated'}`, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCategories, createCategory, getCategory, updateCategory, deleteCategory, toggleCategory };
