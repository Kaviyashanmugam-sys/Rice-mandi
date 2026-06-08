// paymentRoutes.js — Razorpay webhook + callback handlers
const express = require("express");
const router  = express.Router();
const crypto  = require("crypto");
const path    = require("path");
const Order   = require("../models/Order");
const { handlePaymentSuccess, handlePaymentLinkExpired } = require("../services/botService");
const logger  = require("../config/logger");

// ── Razorpay Webhook POST /api/payments/razorpay-webhook ─────────────────────
// Must be raw body — add express.raw() middleware in server.js for this route
router.post("/razorpay-webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const secret    = process.env.RAZORPAY_WEBHOOK_SECRET;

  // Verify signature
  const expected = crypto.createHmac("sha256", secret).update(req.body).digest("hex");
  if (expected !== signature) {
    logger.warn("Razorpay webhook: invalid signature");
    return res.status(400).json({ error: "Invalid signature" });
  }

  const event = JSON.parse(req.body.toString());
  logger.info("Razorpay webhook event:", event.event);

  res.json({ status: "ok" }); // Respond quickly

  try {
    // Payment captured (success)
    if (event.event === "payment_link.paid") {
      const pl        = event.payload.payment_link.entity;
      const payment   = event.payload.payment?.entity;
      await handlePaymentSuccess(pl.id, payment?.id || "");
    }

    // Payment link expired
    if (event.event === "payment_link.expired") {
      const pl = event.payload.payment_link.entity;
      await handlePaymentLinkExpired(pl.id);
    }
  } catch (err) {
    logger.error("Razorpay webhook processing error:", err);
  }
});

// ── Razorpay Callback GET /api/payments/razorpay-callback ────────────────────
// Redirected here after payment on Razorpay page
router.get("/razorpay-callback", async (req, res) => {
  const { razorpay_payment_link_id, razorpay_payment_id, razorpay_payment_link_status } = req.query;

  if (razorpay_payment_link_status === "paid") {
    // Webhook handles the actual logic — just show success page
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Payment Successful</title>
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <style>body{font-family:sans-serif;text-align:center;padding:40px;background:#0f1117;color:#e8edf5}
      .card{background:#161b27;border:1px solid #2a3347;border-radius:16px;padding:32px;max-width:400px;margin:0 auto}
      .icon{font-size:60px;margin-bottom:16px}.green{color:#00d68f}</style>
      </head>
      <body>
        <div class="card">
          <div class="icon">🎉</div>
          <h2 class="green">Payment Successful!</h2>
          <p>Your order is confirmed.<br>Check WhatsApp for invoice & updates.</p>
          <p style="color:#5a6478;font-size:12px">Payment ID: ${razorpay_payment_id}</p>
        </div>
      </body>
      </html>
    `);
  } else {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Payment Status</title>
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <style>body{font-family:sans-serif;text-align:center;padding:40px;background:#0f1117;color:#e8edf5}
      .card{background:#161b27;border:1px solid #2a3347;border-radius:16px;padding:32px;max-width:400px;margin:0 auto}
      .icon{font-size:60px;margin-bottom:16px}.red{color:#ff4757}</style>
      </head>
      <body>
        <div class="card">
          <div class="icon">⚠️</div>
          <h2 class="red">Payment Incomplete</h2>
          <p>Please check WhatsApp to retry payment or cancel the order.</p>
        </div>
      </body>
      </html>
    `);
  }
});

// ── Serve invoice PDFs GET /invoices/:filename ────────────────────────────────
router.get("/invoice/:filename", (req, res) => {
  const filePath = path.join(__dirname, "../uploads/invoices", req.params.filename);
  res.download(filePath, (err) => {
    if (err) res.status(404).json({ error: "Invoice not found" });
  });
});

module.exports = router;
