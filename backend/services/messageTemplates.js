// messageTemplates.js — All WhatsApp bot message builders
// Supports EN / Tamil via lang param (future use — bot reads customer pref from DB)

const templates = {
  welcome: () => ({
    type: "button",
    body: "🌾 *Rice Mandi* — Rameswaram\nNam kadaikku vandhatharkku nandri! 🙏\n\nHow can I help you?",
    buttons: ["🛍️ Shop Now", "🔍 Search Product", "📦 My Orders"],
  }),

  categories: (cats) => ({
    type: "list",
    body: "📦 *Categories*\nEthai vaanga viruppadukireergal?",
    buttonText: "Select Category",
    sections: [{
      title: "Categories",
      rows: cats.map(c => ({ id: `CAT_${c._id}`, title: `${c.icon} ${c.name}`, description: `${c.tamil} • ${c.productCount} products` }))
    }]
  }),

  products: (products, catName) => ({
    type: "list",
    body: `📦 *${catName}*\nSelect pannunga:`,
    buttonText: "Select Product",
    sections: [{
      title: catName,
      rows: products.map(p => ({ id: `PROD_${p._id}`, title: `${p.icon || "📦"} ${p.name}`, description: `₹${p.price}/${p.unit} • Stock: ${p.stockQuantity}${p.unit}` }))
    }]
  }),

  productDetail: (product) => ({
    type: "button",
    body: `${product.icon || "📦"} *${product.name}*\n${product.tamil || ""}\n\n💰 Price: ₹${product.price}/${product.unit}\n📦 Stock: ${product.stockQuantity} ${product.unit}\n\nEvvalvu venum?`,
    buttons: product.quantityOptions?.slice(0, 3).map(q => `${q} ${product.unit}`) || ["1 kg", "5 kg", "10 kg"],
  }),

  itemAdded: (product, qty, cartTotal) => ({
    type: "button",
    body: `✅ *Cart-la serththom!*\n\n${product.icon || "📦"} ${product.name} × ${qty} ${product.unit}\nAmount: ₹${product.price * qty}\n\nCart Total: ₹${cartTotal}\nMeendum verum?`,
    buttons: ["🛍️ Shop More", "🔍 Search", "🛒 View Cart"],
  }),

  viewCart: (items, total, freeDelivery) => ({
    type: "button",
    body: `🛒 *Your Cart*\n\n${items.map(i => `• ${i.name} × ${i.qty} ${i.unit} — ₹${i.price * i.qty}`).join("\n")}\n━━━━━━━━━━━━━\n🚚 Delivery: ${freeDelivery ? "FREE 🎉" : "₹50"}\n*Total: ₹${total + (freeDelivery ? 0 : 50)}*`,
    buttons: ["✅ Checkout", "🗑️ Clear Cart"],
  }),

  // Single-page checkout via WhatsApp Flow
  checkoutFlow: (flowId, flowToken) => ({
    type: "flow",
    body: "📋 *Checkout*\nName, phone, address, payment — oru page-la fill pannunga!",
    flowId,
    flowToken,
    flowCta: "Fill Checkout Form",
  }),

  orderConfirmed: (order) => ({
    type: "button",
    body: `🎉 *Order Confirmed!*\nOrder ID: #${order.orderId}\n\n${order.items.map(i => `• ${i.name} × ${i.quantity} ${i.unit}`).join("\n")}\n━━━━━━━━━━━━━\n*Total: ₹${order.totalAmount}*\n\nThank you! 🙏\nUngal order-ai nangal seyrkkioom.`,
    buttons: ["📦 Track Order"],
  }),

  statusUpdate: (order) => ({
    type: "text",
    body: `📦 *Order Update*\nOrder #${order.orderId}\n\nStatus: ${statusEmoji(order.status)} ${order.status}\n\nFor queries, reply to this message.`
  }),

  myOrders: (orders) => ({
    type: "text",
    body: orders.length === 0
      ? "📦 No orders yet!\n\nShop panna start pannunga 🛍️"
      : `📦 *Your Recent Orders*\n\n${orders.slice(0, 3).map(o => `#${o.orderId} — ₹${o.totalAmount}\nStatus: ${statusEmoji(o.status)} ${o.status}`).join("\n\n")}`
  }),

  searchResults: (products, query) => ({
    type: "list",
    body: products.length === 0
      ? `❌ *"${query}"* — No products found!\n\nVere peyar try pannunga.`
      : `✅ *${products.length} products found!*\nSelect pannunga:`,
    buttonText: "Select Product",
    sections: [{
      title: `Results for "${query}"`,
      rows: products.map(p => ({ id: `PROD_${p._id}`, title: `${p.icon || "📦"} ${p.name}`, description: `${p.tamil} • ₹${p.price}/${p.unit}` }))
    }]
  }),

  error: () => ({
    type: "text",
    body: "⚠️ Something went wrong. Please try again!\n\nType *hi* to restart."
  }),
};

function statusEmoji(status) {
  const map = { pending: "🟡", accepted: "🔵", packed: "🟣", out_for_delivery: "🚚", delivered: "✅", cancelled: "❌" };
  return map[status] || "📦";
}

module.exports = templates;
