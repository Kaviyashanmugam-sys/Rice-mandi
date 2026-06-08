const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  nameInTamil: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  unit: {
    type: String,
    enum: ['kg', 'g', 'litre', 'ml', 'piece', 'packet', 'dozen'],
    default: 'kg'
  },
  minOrderQty: {
    type: Number,
    default: 1,
    min: 0.1
  },
  maxOrderQty: {
    type: Number,
    default: 100
  },
  stockQuantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  image: {
    type: String,
    default: null
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  quantityOptions: {
    type: [Number],
    default: [1, 2, 5, 10, 25]
  }
}, {
  timestamps: true
});

productSchema.index({ category: 1, isAvailable: 1 });
productSchema.index({ name: 'text', nameInTamil: 'text' });

// Virtual: out of stock check
productSchema.virtual('isInStock').get(function () {
  return this.stockQuantity > 0;
});

module.exports = mongoose.model('Product', productSchema);
