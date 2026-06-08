const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: String,
  group: {
    type: String,
    enum: ['shop', 'delivery', 'payment', 'whatsapp', 'notifications'],
    default: 'shop'
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
