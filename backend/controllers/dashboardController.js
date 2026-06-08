const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');

// GET /api/dashboard/summary
const getSummary = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);

    const [
      todayOrders, monthOrders, lastMonthOrders,
      totalCustomers, newCustomers,
      pendingOrders, totalProducts, lowStockProducts
    ] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: today }, orderStatus: { $ne: 'Cancelled' } } },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: thisMonth }, orderStatus: { $ne: 'Cancelled' } } },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: lastMonth, $lte: lastMonthEnd }, orderStatus: { $ne: 'Cancelled' } } },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }
      ]),
      Customer.countDocuments(),
      Customer.countDocuments({ createdAt: { $gte: thisMonth } }),
      Order.countDocuments({ orderStatus: 'Pending' }),
      Product.countDocuments({ isAvailable: true }),
      Product.countDocuments({ stockQuantity: { $lte: 10 } })
    ]);

    const currentRevenue = monthOrders[0]?.revenue || 0;
    const previousRevenue = lastMonthOrders[0]?.revenue || 0;
    const revenueGrowth = previousRevenue > 0
      ? (((currentRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1)
      : 100;

    res.json({
      success: true,
      data: {
        today: { orders: todayOrders[0]?.count || 0, revenue: todayOrders[0]?.revenue || 0 },
        month: { orders: monthOrders[0]?.count || 0, revenue: currentRevenue, growth: parseFloat(revenueGrowth) },
        customers: { total: totalCustomers, newThisMonth: newCustomers },
        pendingOrders,
        products: { total: totalProducts, lowStock: lowStockProducts }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/dashboard/revenue-chart
const getRevenueChart = async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    let startDate, groupFormat;

    if (period === 'week') {
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      groupFormat = '%Y-%m-%d';
    } else if (period === 'month') {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      groupFormat = '%Y-%m-%d';
    } else {
      startDate = new Date(new Date().getFullYear(), 0, 1);
      groupFormat = '%Y-%m';
    }

    const data = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, orderStatus: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/dashboard/top-products
const getTopProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const data = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          totalQty: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/dashboard/category-sales
const getCategorySales = async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category._id',
          categoryName: { $first: '$category.name' },
          totalRevenue: { $sum: '$items.subtotal' },
          totalQty: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSummary, getRevenueChart, getTopProducts, getCategorySales };
