// server.js — Rice Mandi Bot Backend
const express     = require("express");
const helmet      = require("helmet");
const cors        = require("cors");
const morgan      = require("morgan");
const rateLimit   = require("express-rate-limit");
const path        = require("path");
require("dotenv").config();

const connectDB   = require("./config/database");
const logger      = require("./config/logger");

const webhookRoutes  = require("./routes/webhookRoutes");
const authRoutes     = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes  = require("./routes/productRoutes");
const orderRoutes    = require("./routes/orderRoutes");
const customerRoutes = require("./routes/customerRoutes");
const dashboardRoutes= require("./routes/dashboardRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const paymentRoutes  = require("./routes/paymentRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();
connectDB();

// ── Security & logging ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(morgan("combined", { stream: { write: msg => logger.http(msg.trim()) } }));

// ── Rate limiting ──────────────────────────────────────────────────────────────
app.use("/api/", rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));
app.use("/webhook", rateLimit({ windowMs: 1 * 60 * 1000, max: 200 }));

// ── Body parsing ───────────────────────────────────────────────────────────────
// Razorpay webhook needs raw body — mount BEFORE express.json()
app.use("/api/payments/razorpay-webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Static files — serve invoice PDFs ────────────────────────────────────────
app.use("/invoices", express.static(path.join(__dirname, "uploads/invoices")));

// ── Health check ───────────────────────────────────────────────────────────────
app.get("/health", (_, res) => res.json({ status: "ok", time: new Date() }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/webhook",          webhookRoutes);
app.use("/api/auth",         authRoutes);
app.use("/api/categories",   categoryRoutes);
app.use("/api/products",     productRoutes);
app.use("/api/orders",       orderRoutes);
app.use("/api/customers",    customerRoutes);
app.use("/api/dashboard",    dashboardRoutes);
app.use("/api/settings",     settingsRoutes);
app.use("/api/payments",     paymentRoutes);

// ── Error handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`🌾 Rice Mandi Bot running on port ${PORT}`));

module.exports = app;
