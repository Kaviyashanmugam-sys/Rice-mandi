const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  whatsappPhone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  sessionState: {
    type: String,
    enum: [
      'IDLE',
      'WELCOME',
      'BROWSING_CATEGORIES',
      'BROWSING_PRODUCTS',
      'SELECTING_QUANTITY',
      'CART',
      'CHECKOUT_NAME',
      'CHECKOUT_PHONE',
      'CHECKOUT_ADDRESS',
      'CHECKOUT_PAYMENT',
      'ORDER_PLACED'
    ],
    default: 'IDLE'
  },
  sessionData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  cart: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    name: String,
    price: Number,
    quantity: Number,
    unit: String,
    subtotal: Number
  }],
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  lastInteraction: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

customerSchema.index({ whatsappPhone: 1 });
customerSchema.index({ lastInteraction: -1 });

module.exports = mongoose.model('Customer', customerSchema);
