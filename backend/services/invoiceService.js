// invoiceService.js — Generate Invoice PDF using PDFKit
const PDFDocument = require("pdfkit");
const fs          = require("fs");
const path        = require("path");
const logger      = require("../config/logger");

const UPLOADS_DIR = path.join(__dirname, "../uploads/invoices");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

/**
 * Generate a PDF invoice and return the file path.
 * order = { orderId, customerName, customerPhone, items[], subtotal, gst, gstRate, deliveryCharge, totalAmount, paymentMethod, createdAt }
 */
async function generateInvoicePDF(order) {
  return new Promise((resolve, reject) => {
    try {
      const filename = `Invoice-${order.orderId}.pdf`;
      const filePath = path.join(UPLOADS_DIR, filename);

      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const GREEN  = "#2d7a4f";
      const BLACK  = "#1a1a1a";
      const GREY   = "#666666";
      const LGREY  = "#f5f5f5";
      const W      = 495; // usable width

      // ── Header ──────────────────────────────────────────────────────────────
      doc.rect(50, 40, W, 70).fill(GREEN);
      doc.fillColor("#fff").fontSize(22).font("Helvetica-Bold")
         .text("RICE MANDI", 65, 55);
      doc.fontSize(10).font("Helvetica")
         .text("Rameswaram, Tamil Nadu | WhatsApp: +91 XXXXX XXXXX", 65, 82);
      doc.text("GSTIN: 33XXXXX0000X1ZX  |  FSSAI: XXXXXXXXXXXXXX", 65, 96);

      // ── Invoice title ────────────────────────────────────────────────────────
      doc.fillColor(BLACK).fontSize(18).font("Helvetica-Bold")
         .text("TAX INVOICE", 50, 130, { align: "right" });
      doc.moveTo(50, 155).lineTo(545, 155).lineWidth(1).strokeColor(GREEN).stroke();

      // ── Invoice meta ─────────────────────────────────────────────────────────
      const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric"
      });

      doc.fontSize(10).font("Helvetica-Bold").fillColor(BLACK)
         .text("Invoice No:", 50, 165).text("Date:", 50, 180)
         .text("Payment:", 50, 195);
      doc.font("Helvetica").fillColor(GREY)
         .text(order.orderId, 150, 165)
         .text(dateStr,       150, 180)
         .text(order.paymentMethod === "cod" ? "Cash on Delivery" : "Online (Razorpay)", 150, 195);

      // ── Bill To ───────────────────────────────────────────────────────────────
      doc.font("Helvetica-Bold").fillColor(BLACK)
         .text("Bill To:", 350, 165);
      doc.font("Helvetica").fillColor(GREY)
         .text(order.customerName,  350, 180)
         .text(order.customerPhone, 350, 195)
         .text(order.deliveryAddress || "", 350, 210, { width: 195 });

      doc.moveTo(50, 235).lineTo(545, 235).lineWidth(0.5).strokeColor("#ccc").stroke();

      // ── Table header ─────────────────────────────────────────────────────────
      doc.rect(50, 245, W, 22).fill(GREEN);
      doc.fillColor("#fff").fontSize(9).font("Helvetica-Bold");
      const cols = { item: 55, qty: 290, rate: 360, gst: 420, total: 475 };
      doc.text("ITEM",       cols.item, 251)
         .text("QTY",        cols.qty,  251)
         .text("RATE (₹)",   cols.rate, 251)
         .text(`GST(${order.gstRate}%)`, cols.gst, 251)
         .text("TOTAL (₹)",  cols.total, 251);

      // ── Table rows ────────────────────────────────────────────────────────────
      let y = 275;
      doc.fontSize(9).font("Helvetica");
      order.items.forEach((item, i) => {
        const rowBg = i % 2 === 0 ? "#fff" : LGREY;
        doc.rect(50, y - 4, W, 20).fill(rowBg);
        const itemGst    = (item.price * item.quantity * order.gstRate) / 100;
        const itemTotal  = item.price * item.quantity + itemGst;
        doc.fillColor(BLACK)
           .text(item.name,                                cols.item, y, { width: 225 })
           .text(`${item.quantity} ${item.unit}`,          cols.qty,  y)
           .text(`₹${item.price.toFixed(2)}`,             cols.rate, y)
           .text(`₹${itemGst.toFixed(2)}`,                cols.gst,  y)
           .text(`₹${itemTotal.toFixed(2)}`,              cols.total, y);
        y += 22;
      });

      // ── Totals ────────────────────────────────────────────────────────────────
      doc.moveTo(50, y + 5).lineTo(545, y + 5).lineWidth(0.5).strokeColor("#ccc").stroke();
      y += 15;

      const totals = [
        ["Subtotal",       `₹${order.subtotal.toFixed(2)}`],
        [`GST (${order.gstRate}%)`, `₹${order.gst.toFixed(2)}`],
        ["Delivery",       order.deliveryCharge > 0 ? `₹${order.deliveryCharge.toFixed(2)}` : "FREE"],
      ];
      totals.forEach(([label, val]) => {
        doc.font("Helvetica").fillColor(GREY).fontSize(9)
           .text(label, 380, y).text(val, 480, y, { align: "right", width: 60 });
        y += 16;
      });

      // Grand total
      doc.rect(370, y, 175, 24).fill(GREEN);
      doc.fillColor("#fff").font("Helvetica-Bold").fontSize(11)
         .text("TOTAL",         380, y + 6)
         .text(`₹${order.totalAmount.toFixed(2)}`, 380, y + 6, { align: "right", width: 155 });
      y += 40;

      // ── Footer ────────────────────────────────────────────────────────────────
      doc.moveTo(50, y).lineTo(545, y).lineWidth(1).strokeColor(GREEN).stroke();
      doc.fillColor(GREY).font("Helvetica").fontSize(8)
         .text("Thank you for shopping with Rice Mandi! — நன்றி! 🙏", 50, y + 10, { align: "center", width: W })
         .text("For support, WhatsApp us or call +91 XXXXX XXXXX", 50, y + 22, { align: "center", width: W });

      doc.end();
      stream.on("finish", () => resolve(filePath));
      stream.on("error",  reject);
    } catch (err) {
      logger.error("generateInvoicePDF error:", err);
      reject(err);
    }
  });
}

module.exports = { generateInvoicePDF };
