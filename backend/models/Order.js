const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name:     String,
  unit:     String,
  price:    Number,
  quantity: Number,
  subtotal: Number,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    default: () => {
      const ts  = Date.now().toString(36).toUpperCase();
      const uid = uuidv4().split("-")[0].toUpperCase();
      return `RM-${ts}-${uid}`;
    }
  },
  customer:        { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  customerName:    String,
  customerPhone:   String,
  deliveryAddress: String,
  items:           [orderItemSchema],

  subtotal:        { type: Number, default: 0 },
  gst:             { type: Number, default: 0 },
  gstRate:         { type: Number, default: 5 },
  deliveryCharge:  { type: Number, default: 0 },
  totalAmount:     { type: Number, default: 0 },

  paymentMethod: {
    type: String,
    enum: ["razorpay", "cash_on_delivery", "upi", "bank_transfer"],
    default: "razorpay"
  },
  status: {
    type: String,
    enum: ["pending_payment","accepted","packed","out_for_delivery","delivered","cancelled","payment_link_expired"],
    default: "pending_payment"
  },

  // Razorpay
  razorpayPaymentLinkId:  String,
  razorpayPaymentLinkUrl: String,
  razorpayPaymentId:      String,
  paymentLinkExpiresAt:   Date,
  paidAt:                 Date,

  // Invoice
  invoicePath:  String,
  invoiceSentAt:Date,

  statusHistory: [{
    status:    String,
    changedAt: { type: Date, default: Date.now },
    note:      String,
  }],
}, { timestamps: true });

// Auto-push status history on status change
orderSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.statusHistory.push({ status: this.status, changedAt: new Date() });
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
