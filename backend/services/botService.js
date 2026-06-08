// botService.js — Rice Mandi WhatsApp Bot State Machine
// Flow: Welcome → Name → Categories → Products → Quantity → Bill Summary → Invoice PDF → Payment → Delivered
const Customer        = require("../models/Customer");
const Product         = require("../models/Product");
const Category        = require("../models/Category");
const Order           = require("../models/Order");
const Settings        = require("../models/Settings");
const wa              = require("./whatsappService");
const T               = require("./messageTemplates");
const { createPaymentLink, cancelPaymentLink } = require("./razorpayService");
const { generateInvoicePDF }                   = require("./invoiceService");
const logger          = require("../config/logger");

const GST_RATE        = 5; // 5% GST on groceries
const FREE_DELIVERY_ABOVE = 1000;
const DELIVERY_CHARGE     = 50;

// ── Entry point ────────────────────────────────────────────────────────────────
async function handleIncomingMessage(msg) {
  const { from, type } = msg;

  let customer = await Customer.findOne({ whatsappPhone: from });
  if (!customer) customer = await Customer.create({ whatsappPhone: from, sessionState: "IDLE" });
  if (customer.isBlocked) return;

  await wa.markAsRead(msg.id);

  const rawText  = (msg.text?.body || msg.interactive?.list_reply?.title || msg.interactive?.button_reply?.title || msg.button?.text || "").trim();
  const actionId = (msg.interactive?.list_reply?.id || msg.interactive?.button_reply?.id || "").toUpperCase();
  const lower    = rawText.toLowerCase();

  // ── Global commands ────────────────────────────────────────────────────────
  if (["hi","hello","start","menu","வணக்கம்","மெனு"].includes(lower)) return sendWelcome(customer);
  if (actionId === "HOW_IT_WORKS")        return sendHowItWorks(customer);
  if (actionId === "START_ORDER")         return askName(customer);
  if (actionId === "BROWSE_CATEGORIES")   return sendCategories(customer);
  if (actionId === "VIEW_CART")           return sendCart(customer);
  if (actionId === "CLEAR_CART")          { customer.cart = []; await customer.save(); return sendWelcome(customer); }
  if (actionId === "MY_ORDERS")           return sendMyOrders(customer);
  if (actionId === "PAY_NOW")             return sendPaymentLink(customer);
  if (actionId === "PAY_AGAIN")           return regeneratePaymentLink(customer);
  if (actionId === "CANCEL_ORDER")        return handleCancelOrder(customer);
  if (actionId === "CHECKOUT_RAZORPAY")   return sendPaymentLink(customer);
  if (actionId === "CHECKOUT_COD")        return handleCODCheckout(customer);
  if (actionId === "SEARCH")             { customer.sessionState = "SEARCHING"; await customer.save(); return wa.sendTextMessage(from, "🔍 *Search Product*\n\nProduct peyar type pannunga:\n(English or Tamil)\n\nExample: 'ponni' or 'பொன்னி'"); }

  // ── State machine ──────────────────────────────────────────────────────────
  switch (customer.sessionState) {
    case "IDLE":
    case "WELCOME":
      return sendWelcome(customer);

    case "AWAITING_NAME":
      if (!rawText || rawText.length < 2) return wa.sendTextMessage(from, "👋 Ungal peyar sollunga (at least 2 letters):");
      customer.name = rawText;
      customer.sessionState = "BROWSING_CATEGORIES";
      await customer.save();
      await wa.sendTextMessage(from, `Thanks, *${rawText}*! 🙌 Let's pick your groceries.`);
      return sendCategories(customer);

    case "BROWSING_CATEGORIES":
      if (actionId.startsWith("CAT_")) return handleCategorySelected(customer, actionId.replace("CAT_", ""));
      return sendCategories(customer);

    case "BROWSING_PRODUCTS":
      if (actionId.startsWith("PROD_")) return handleProductSelected(customer, actionId.replace("PROD_", ""));
      return sendProducts(customer, customer.sessionData?.categoryId);

    case "SELECTING_QUANTITY":
      return handleQuantityInput(customer, rawText);

    case "SEARCHING":
      return handleSearch(customer, rawText);

    case "AWAITING_PAYMENT":
      // User might reply something — remind them
      return wa.sendTextMessage(from, `⏳ Payment pending for order *${customer.sessionData?.currentOrderId}*.\n\nTap *Pay Now* in the payment message or type *cancel* to cancel.`);

    default:
      return sendWelcome(customer);
  }
}

// ── Screens ────────────────────────────────────────────────────────────────────

async function sendWelcome(customer) {
  customer.sessionState = "WELCOME";
  await customer.save();
  const name = customer.name ? `, ${customer.name}` : "";
  return wa.sendButtonMessage(customer.whatsappPhone,
    `🌾 *Rice Mandi* — Rameswaram\nVandhatharkku nandri${name}! 🙏\n\nYour trusted grocery partner.\nOrder rice, dal, oil & more — delivered fresh!`,
    ["🚀 Start Order", "📦 My Orders", "❓ How it Works"]
  );
}

async function sendHowItWorks(customer) {
  await wa.sendTextMessage(customer.whatsappPhone,
    `*How It Works* 📋\n\n1️⃣ Share your name\n2️⃣ Browse categories & pick products\n3️⃣ Choose quantity\n4️⃣ Review bill & pay (Razorpay or COD)\n5️⃣ Get Invoice PDF on WhatsApp\n6️⃣ We deliver to your door! 🚚\n\nType *hi* to start ordering.`
  );
}

async function askName(customer) {
  customer.sessionState = "AWAITING_NAME";
  await customer.save();
  return wa.sendTextMessage(customer.whatsappPhone, "👋 Great! What is your *full name*?");
}

async function sendCategories(customer) {
  customer.sessionState = "BROWSING_CATEGORIES";
  await customer.save();
  const cats = await Category.find({ isActive: true }).sort("sortOrder");
  const sections = [{
    title: "📦 Categories",
    rows: cats.map(c => ({
      id:          `CAT_${c._id}`,
      title:       `${c.icon} ${c.name}`,
      description: `${c.tamil} — ${c.productCount || ""} products`
    }))
  }];
  return wa.sendListMessage(customer.whatsappPhone,
    `📦 *Categories*\nEthai vaanga viruppadukireergal, ${customer.name || ""}?`,
    "Select Category", sections
  );
}

async function handleCategorySelected(customer, categoryId) {
  const cat = await Category.findById(categoryId);
  if (!cat) return sendCategories(customer);
  customer.sessionState = "BROWSING_PRODUCTS";
  customer.sessionData  = { ...customer.sessionData, categoryId, categoryName: cat.name };
  await customer.save();
  return sendProducts(customer, categoryId, cat);
}

async function sendProducts(customer, categoryId, cat) {
  const products = await Product.find({ category: categoryId, isAvailable: true });
  if (!cat) cat = await Category.findById(categoryId);
  const sections = [{
    title: cat.name,
    rows: products.map(p => ({
      id:          `PROD_${p._id}`,
      title:       `${p.icon || "📦"} ${p.name}`,
      description: `${p.tamil} — ₹${p.price}/${p.unit}`
    }))
  }];
  return wa.sendListMessage(customer.whatsappPhone,
    `${cat.icon} *${cat.name}*\nSelect pannunga:`,
    "Select Product", sections
  );
}

async function handleProductSelected(customer, productId) {
  const product = await Product.findById(productId);
  if (!product) return sendCategories(customer);

  customer.sessionState = "SELECTING_QUANTITY";
  customer.sessionData  = { ...customer.sessionData, productId };
  await customer.save();

  // Send product image + detail
  if (product.imageUrl) {
    await wa.sendImageMessage(customer.whatsappPhone, product.imageUrl,
      `${product.icon || "📦"} *${product.name}*\n₹${product.price}/${product.unit}`
    );
  }

  return wa.sendButtonMessage(customer.whatsappPhone,
    `${product.icon || "📦"} *${product.name}* — selected ✅\n\n💰 Rate: ₹${product.price} / ${product.unit}\n📦 Stock: ${product.stockQuantity} ${product.unit}\n\nTap a quick preset or *type quantity*\n(e.g. 1, 5, 10).\n_Example: 5_\n\nPresets below · or type any quantity`,
    product.quantityOptions?.slice(0, 3).map(q => `${q} ${product.unit}`) || ["1 kg", "5 kg", "10 kg"]
  );
}

async function handleQuantityInput(customer, rawText) {
  const productId = customer.sessionData?.productId;
  const product   = await Product.findById(productId);
  if (!product) return sendCategories(customer);

  // Parse quantity
  const qty = parseFloat(rawText.replace(/[^\d.]/g, ""));
  const min = product.quantityOptions?.[0] || 0.5;
  const max = product.stockQuantity;

  if (isNaN(qty) || qty < min || qty > max) {
    return wa.sendTextMessage(customer.whatsappPhone,
      `⚠️ *Invalid quantity.*\n\nPlease enter a number between *${min}* and *${max}* ${product.unit}.\n\n_Example: ${product.quantityOptions?.[1] || 5}_`
    );
  }

  // Add to cart
  const existing = customer.cart.findIndex(i => i.product?.toString() === productId);
  if (existing >= 0) {
    customer.cart[existing].quantity += qty;
    customer.cart[existing].subtotal += product.price * qty;
  } else {
    customer.cart.push({
      product:  product._id,
      name:     product.name,
      unit:     product.unit,
      price:    product.price,
      quantity: qty,
      subtotal: product.price * qty,
    });
  }

  const cartSubtotal = customer.cart.reduce((s, i) => s + i.subtotal, 0);
  customer.sessionState = "BROWSING_CATEGORIES";
  await customer.save();

  return wa.sendButtonMessage(customer.whatsappPhone,
    `✅ *Cart-la serththom!*\n\n${product.icon || "📦"} ${product.name} × ${qty} ${product.unit}\nAmount: ₹${(product.price * qty).toFixed(2)}\n\nCart Total: ₹${cartSubtotal.toFixed(2)}\nMeendum verum?`,
    ["🛍️ Add More", "🛒 View Cart & Pay", "🔍 Search"]
  );
}

async function sendCart(customer) {
  if (!customer.cart.length) {
    return wa.sendButtonMessage(customer.whatsappPhone,
      "🛒 Cart empty-ya irukku!\nProductgal add pannunga.",
      ["🛍️ Start Shopping", "🔍 Search Product"]
    );
  }
  const subtotal     = customer.cart.reduce((s, i) => s + i.subtotal, 0);
  const gst          = subtotal * GST_RATE / 100;
  const delivery     = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_CHARGE;
  const total        = subtotal + gst + delivery;
  const itemLines    = customer.cart.map(i => `• ${i.name} × ${i.quantity} ${i.unit} — ₹${i.subtotal.toFixed(2)}`).join("\n");

  return wa.sendButtonMessage(customer.whatsappPhone,
    `🛒 *Order Bill Summary*\n\n${itemLines}\n━━━━━━━━━━━━━━\nSubtotal:  ₹${subtotal.toFixed(2)}\nGST (${GST_RATE}%): ₹${gst.toFixed(2)}\nDelivery:  ${delivery === 0 ? "FREE 🎉" : `₹${delivery}`}\n*Total: ₹${total.toFixed(2)}*\n\nSelect payment method:`,
    ["💳 Pay via Razorpay", "💵 Cash on Delivery"]
  );
}

// ── Payment ────────────────────────────────────────────────────────────────────

async function sendPaymentLink(customer) {
  if (!customer.cart.length) return sendCart(customer);

  const subtotal  = customer.cart.reduce((s, i) => s + i.subtotal, 0);
  const gst       = subtotal * GST_RATE / 100;
  const delivery  = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_CHARGE;
  const total     = subtotal + gst + delivery;

  // Create order in DB
  const order = await Order.create({
    customer:        customer._id,
    customerName:    customer.name,
    customerPhone:   customer.whatsappPhone,
    items:           customer.cart.map(i => ({ product: i.product, name: i.name, unit: i.unit, price: i.price, quantity: i.quantity, subtotal: i.subtotal })),
    subtotal,
    gst,
    gstRate:         GST_RATE,
    deliveryCharge:  delivery,
    totalAmount:     total,
    paymentMethod:   "razorpay",
    status:          "pending_payment",
  });

  // Create Razorpay payment link
  let payLink;
  try {
    payLink = await createPaymentLink({
      orderId:       order.orderId,
      amount:        total,
      customerName:  customer.name || "Customer",
      customerPhone: customer.whatsappPhone,
    });
    order.razorpayPaymentLinkId  = payLink.paymentLinkId;
    order.razorpayPaymentLinkUrl = payLink.paymentLinkUrl;
    order.paymentLinkExpiresAt   = payLink.expiresAt;
    await order.save();
  } catch (err) {
    logger.error("Razorpay link creation failed:", err);
    return wa.sendTextMessage(customer.whatsappPhone,
      "⚠️ Payment link create பண்ண முடியவில்லை. Please try again or choose COD."
    );
  }

  // Clear cart, update session
  customer.cart = [];
  customer.sessionState = "AWAITING_PAYMENT";
  customer.sessionData  = { currentOrderId: order.orderId, currentOrderDbId: order._id };
  await customer.save();

  // Send payment message
  return wa.sendButtonMessage(customer.whatsappPhone,
    `💳 *Secure Payment*\n\nOrder *${order.orderId}*\nAmount: *₹${total.toFixed(2)}*\n\nTap below to pay securely via Razorpay.\nUPI • Cards • Net Banking accepted.\n\n_Payment link expires in 30 minutes_\n\n👉 ${payLink.paymentLinkUrl}`,
    ["✅ Pay Now", "❌ Cancel Order"]
  );
}

async function handleCODCheckout(customer) {
  if (!customer.cart.length) return sendCart(customer);

  const subtotal  = customer.cart.reduce((s, i) => s + i.subtotal, 0);
  const gst       = subtotal * GST_RATE / 100;
  const delivery  = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_CHARGE;
  const total     = subtotal + gst + delivery;

  const order = await Order.create({
    customer:       customer._id,
    customerName:   customer.name,
    customerPhone:  customer.whatsappPhone,
    items:          customer.cart.map(i => ({ product: i.product, name: i.name, unit: i.unit, price: i.price, quantity: i.quantity, subtotal: i.subtotal })),
    subtotal,
    gst,
    gstRate:        GST_RATE,
    deliveryCharge: delivery,
    totalAmount:    total,
    paymentMethod:  "cash_on_delivery",
    status:         "accepted",
  });

  customer.cart         = [];
  customer.sessionState = "IDLE";
  customer.totalOrders  = (customer.totalOrders || 0) + 1;
  customer.totalSpent   = (customer.totalSpent  || 0) + total;
  await customer.save();

  // Generate & send invoice PDF
  await sendInvoiceAndConfirmation(customer, order);
}

async function sendInvoiceAndConfirmation(customer, order) {
  const itemLines = order.items.map(i => `• ${i.name} × ${i.quantity} ${i.unit}`).join("\n");
  const payStr    = order.paymentMethod === "cash_on_delivery" ? "Cash on Delivery" : "Razorpay";

  // 1. Send order confirmed text
  await wa.sendButtonMessage(customer.whatsappPhone,
    `🎉 *Order Confirmed!*\nOrder ID: *${order.orderId}*\n\n${itemLines}\n━━━━━━━━━━━━━━\nSubtotal:  ₹${order.subtotal.toFixed(2)}\nGST (${order.gstRate}%): ₹${order.gst.toFixed(2)}\nDelivery:  ${order.deliveryCharge === 0 ? "FREE 🎉" : `₹${order.deliveryCharge}`}\n*Total: ₹${order.totalAmount.toFixed(2)}*\n\nPayment: ${payStr}\n\nThank you, *${order.customerName}*! 🙏\nUngal order-ai nangal seyrkkioom.`,
    ["📦 Track My Orders"]
  );

  // 2. Generate PDF invoice
  try {
    const pdfPath = await generateInvoicePDF({
      orderId:         order.orderId,
      customerName:    order.customerName,
      customerPhone:   order.customerPhone,
      deliveryAddress: order.deliveryAddress || "",
      items:           order.items,
      subtotal:        order.subtotal,
      gst:             order.gst,
      gstRate:         order.gstRate,
      deliveryCharge:  order.deliveryCharge,
      totalAmount:     order.totalAmount,
      paymentMethod:   order.paymentMethod,
      createdAt:       order.createdAt,
    });

    // 3. Send PDF via WhatsApp
    const pdfUrl = `${process.env.BACKEND_URL}/invoices/${order.orderId}.pdf`;
    await wa.sendDocumentMessage(
      customer.whatsappPhone,
      pdfUrl,
      `Invoice-${order.orderId}.pdf`,
      `📄 Your invoice *${order.orderId}* — please review before payment.`
    );
  } catch (err) {
    logger.error("Invoice generation/send error:", err);
    // Don't block — order is still confirmed
  }
}

async function regeneratePaymentLink(customer) {
  const orderId = customer.sessionData?.currentOrderDbId;
  if (!orderId) return sendWelcome(customer);

  const order = await Order.findById(orderId);
  if (!order) return sendWelcome(customer);

  // Cancel old link if exists
  if (order.razorpayPaymentLinkId) {
    await cancelPaymentLink(order.razorpayPaymentLinkId).catch(() => {});
  }

  // New link
  const payLink = await createPaymentLink({
    orderId:      order.orderId,
    amount:       order.totalAmount,
    customerName: order.customerName || customer.name,
    customerPhone: customer.whatsappPhone,
  });

  order.razorpayPaymentLinkId  = payLink.paymentLinkId;
  order.razorpayPaymentLinkUrl = payLink.paymentLinkUrl;
  order.paymentLinkExpiresAt   = payLink.expiresAt;
  order.status                 = "pending_payment";
  await order.save();

  customer.sessionState = "AWAITING_PAYMENT";
  await customer.save();

  return wa.sendButtonMessage(customer.whatsappPhone,
    `🔄 *Fresh Payment Link*\n\nOrder *${order.orderId}*\nAmount: *₹${order.totalAmount.toFixed(2)}*\n\n👉 ${payLink.paymentLinkUrl}\n\n_Expires in 30 minutes_`,
    ["✅ Pay Now", "❌ Cancel Order"]
  );
}

async function handleCancelOrder(customer) {
  const orderId = customer.sessionData?.currentOrderDbId;
  if (orderId) {
    const order = await Order.findById(orderId);
    if (order) {
      order.status = "cancelled";
      await order.save();
      if (order.razorpayPaymentLinkId) {
        await cancelPaymentLink(order.razorpayPaymentLinkId).catch(() => {});
      }
    }
  }
  customer.sessionState = "WELCOME";
  customer.sessionData  = {};
  await customer.save();
  return wa.sendTextMessage(customer.whatsappPhone,
    "❌ Order cancelled.\n\nType *hi* to start a new order."
  );
}

async function handleSearch(customer, query) {
  if (!query || query.length < 2) return wa.sendTextMessage(customer.whatsappPhone, "Please type at least 2 characters to search.");
  const results = await Product.find({
    isAvailable: true,
    $or: [
      { name:     { $regex: query, $options: "i" } },
      { tamil:    { $regex: query, $options: "i" } },
      { category: { $regex: query, $options: "i" } },
    ]
  }).limit(5);

  if (!results.length) {
    return wa.sendTextMessage(customer.whatsappPhone,
      `❌ *"${query}"* — No products found!\n\nVere peyar try pannunga or type *menu* to browse categories.`
    );
  }
  const sections = [{
    title: `Results for "${query}"`,
    rows: results.map(p => ({
      id:          `PROD_${p._id}`,
      title:       `${p.icon || "📦"} ${p.name}`,
      description: `${p.tamil} — ₹${p.price}/${p.unit}`
    }))
  }];
  customer.sessionState = "BROWSING_PRODUCTS";
  await customer.save();
  return wa.sendListMessage(customer.whatsappPhone,
    `✅ *${results.length} products found!*\nSelect pannunga:`,
    "Select Product", sections
  );
}

async function sendMyOrders(customer) {
  const orders = await Order.find({ customer: customer._id }).sort("-createdAt").limit(3);
  if (!orders.length) {
    return wa.sendTextMessage(customer.whatsappPhone, "📦 No orders yet!\n\nType *hi* to start ordering 🛍️");
  }
  const statusEmoji = { pending_payment:"⏳", accepted:"🔵", packed:"📦", out_for_delivery:"🚚", delivered:"✅", cancelled:"❌" };
  const lines = orders.map(o => `#${o.orderId} — ₹${o.totalAmount.toFixed(2)}\nStatus: ${statusEmoji[o.status] || "📦"} ${o.status.replace(/_/g," ")}`).join("\n\n");
  return wa.sendTextMessage(customer.whatsappPhone, `📦 *Your Recent Orders*\n\n${lines}\n\nType *hi* for main menu.`);
}

// Called from Razorpay webhook when payment succeeds
async function handlePaymentSuccess(razorpayOrderId, paymentId) {
  try {
    const order = await Order.findOne({ razorpayPaymentLinkId: razorpayOrderId });
    if (!order || order.status === "accepted") return;

    order.status          = "accepted";
    order.razorpayPaymentId = paymentId;
    order.paidAt          = new Date();
    await order.save();

    const customer = await Customer.findById(order.customer);
    if (customer) {
      customer.sessionState = "IDLE";
      customer.totalOrders  = (customer.totalOrders || 0) + 1;
      customer.totalSpent   = (customer.totalSpent  || 0) + order.totalAmount;
      await customer.save();
      await sendInvoiceAndConfirmation(customer, order);
    }
  } catch (err) {
    logger.error("handlePaymentSuccess error:", err);
  }
}

// Called when Razorpay payment link expires
async function handlePaymentLinkExpired(paymentLinkId) {
  try {
    const order = await Order.findOne({ razorpayPaymentLinkId: paymentLinkId });
    if (!order) return;
    order.status = "payment_link_expired";
    await order.save();

    const customer = await Customer.findById(order.customer);
    if (customer) {
      await wa.sendButtonMessage(customer.whatsappPhone,
        `⏰ *Payment Link Expired*\n\nThe payment link for order *${order.orderId}* has expired.\n\nAmount: ₹${order.totalAmount.toFixed(2)}\n\nYou can generate a fresh payment link or cancel this order.`,
        ["🔄 Pay Again", "❌ Cancel Order"]
      );
    }
  } catch (err) {
    logger.error("handlePaymentLinkExpired error:", err);
  }
}

async function sendStatusUpdate(customer, order) {
  const statusEmoji = { pending_payment:"⏳", accepted:"🔵", packed:"📦", out_for_delivery:"🚚", delivered:"✅", cancelled:"❌" };
  await wa.sendTextMessage(customer.whatsappPhone,
    `📦 *Order Update*\nOrder *#${order.orderId}*\n\nStatus: ${statusEmoji[order.status] || "📦"} ${order.status.replace(/_/g," ")}\n\nFor queries, reply to this message.`
  );
}

module.exports = {
  handleIncomingMessage,
  handlePaymentSuccess,
  handlePaymentLinkExpired,
  sendStatusUpdate,
  sendInvoiceAndConfirmation,
};
