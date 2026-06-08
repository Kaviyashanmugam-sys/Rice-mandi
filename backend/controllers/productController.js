const Product = require('../models/Product');
const Category = require('../models/Category');

// GET /api/products
const getProducts = async (req, res) => {
  try {
    const { category, available, featured, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (available === 'true') filter.isAvailable = true;
    if (featured === 'true') filter.isFeatured = true;
    if (search) filter.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name icon')
        .sort({ sortOrder: 1, name: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(filter)
    ]);

    res.json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/products
const createProduct = async (req, res) => {
  try {
    const {
      name, nameInTamil, description, category, price, unit,
      minOrderQty, maxOrderQty, stockQuantity, isAvailable,
      isFeatured, sortOrder, quantityOptions
    } = req.body;

    const cat = await Category.findById(category);
    if (!cat) return res.status(400).json({ success: false, message: 'Category not found' });

    const product = await Product.create({
      name, nameInTamil, description, category, price, unit,
      minOrderQty, maxOrderQty, stockQuantity,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      isFeatured, sortOrder, quantityOptions,
      image: req.file ? `/uploads/${req.file.filename}` : null
    });

    await product.populate('category', 'name icon');
    res.status(201).json({ success: true, message: 'Product created', data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/products/:id
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true, runValidators: true
    }).populate('category', 'name icon');

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product updated', data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/products/:id/stock
const updateStock = async (req, res) => {
  try {
    const { quantity, operation } = req.body; // operation: 'add' | 'subtract' | 'set'
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (operation === 'add') product.stockQuantity += quantity;
    else if (operation === 'subtract') product.stockQuantity = Math.max(0, product.stockQuantity - quantity);
    else product.stockQuantity = quantity;

    product.isAvailable = product.stockQuantity > 0;
    await product.save();

    res.json({ success: true, message: 'Stock updated', data: { stockQuantity: product.stockQuantity } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PATCH /api/products/:id/toggle
const toggleAvailability = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    product.isAvailable = !product.isAvailable;
    await product.save();
    res.json({ success: true, message: `Product ${product.isAvailable ? 'enabled' : 'disabled'}`, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/products/low-stock
const getLowStock = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const products = await Product.find({ stockQuantity: { $lte: threshold } })
      .populate('category', 'name')
      .sort({ stockQuantity: 1 });
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts, createProduct, getProduct, updateProduct, deleteProduct,
  updateStock, toggleAvailability, getLowStock
};
