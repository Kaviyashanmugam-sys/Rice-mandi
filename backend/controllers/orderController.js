const Order = require('../models/Order');
const Customer = require('../models/Customer');
const { sendStatusUpdate } = require('../services/botService');
const logger = require('../config/logger');

// GET /api/orders
const getOrders = async (req, res) => {
  try {
    const {
      status, page = 1, limit = 20, search, startDate, endDate, paymentMethod
    } = req.query;

    const filter = {};
    if (status) filter.orderStatus = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } }
      ];
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59));
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('customer', 'whatsappPhone'),
      Order.countDocuments(filter)
    ]);

    res.json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/orders/:id
const getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      $or: [{ _id: req.params.id }, { orderId: req.params.id }]
    }).populate('customer', 'whatsappPhone name').populate('items.product', 'name image');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['Pending', 'Accepted', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findOne({
      $or: [{ _id: req.params.id }, { orderId: req.params.id }]
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const previousStatus = order.orderStatus;
    order.orderStatus = status;
    if (note) order.statusHistory[order.statusHistory.length - 1].note = note;
    if (status === 'Delivered') {
      order.deliveredAt = new Date();
      order.paymentStatus = order.paymentMethod === 'COD' ? 'Paid' : order.paymentStatus;
    }
    await order.save();

    // Send WhatsApp notification
    if (status !== previousStatus) {
      await sendStatusUpdate(order);
    }

    logger.info(`Order #${order.orderId} status: ${previousStatus} → ${status}`);
    res.json({ success: true, message: `Order status updated to ${status}`, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/orders/:id/payment
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: 'Payment status updated', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/orders/stats/summary
const getOrderStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayStats, monthStats, statusCounts, recentOrders] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: today }, orderStatus: { $ne: 'Cancelled' } } },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: thisMonth }, orderStatus: { $ne: 'Cancelled' } } },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
      ]),
      Order.find({ orderStatus: 'Pending' }).sort({ createdAt: -1 }).limit(5)
    ]);

    res.json({
      success: true,
      data: {
        today: todayStats[0] || { count: 0, revenue: 0 },
        month: monthStats[0] || { count: 0, revenue: 0 },
        byStatus: statusCounts,
        pendingOrders: recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getOrders, getOrder, updateOrderStatus, updatePaymentStatus, getOrderStats };
