// razorpayService.js — Razorpay payment link creation & verification
const Razorpay = require("razorpay");
const crypto   = require("crypto");
const logger   = require("../config/logger");

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create a payment link that expires in 30 minutes
async function createPaymentLink({ orderId, amount, customerName, customerPhone, description }) {
  try {
    const expireBy = Math.floor(Date.now() / 1000) + 30 * 60; // 30 min from now

    const link = await razorpay.paymentLink.create({
      amount:      Math.round(amount * 100), // paise
      currency:    "INR",
      accept_partial: false,
      description: description || `Rice Mandi Order #${orderId}`,
      customer: {
        name:    customerName,
        contact: customerPhone.startsWith("+") ? customerPhone : `+91${customerPhone}`,
      },
      notify: { sms: false, email: false }, // We send via WhatsApp
      reminder_enable: false,
      notes: { orderId },
      callback_url:    `${process.env.BACKEND_URL}/api/payments/razorpay-callback`,
      callback_method: "get",
      expire_by:       expireBy,
    });

    return {
      paymentLinkId:  link.id,
      paymentLinkUrl: link.short_url,
      expiresAt:      new Date(expireBy * 1000),
    };
  } catch (err) {
    logger.error("Razorpay createPaymentLink error:", err);
    throw err;
  }
}

// Verify webhook signature from Razorpay
function verifyWebhookSignature(body, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(body))
    .digest("hex");
  return expected === signature;
}

// Cancel / expire a payment link
async function cancelPaymentLink(paymentLinkId) {
  try {
    await razorpay.paymentLink.cancel(paymentLinkId);
  } catch (err) {
    logger.error("Razorpay cancelPaymentLink error:", err);
  }
}

module.exports = { createPaymentLink, verifyWebhookSignature, cancelPaymentLink };
