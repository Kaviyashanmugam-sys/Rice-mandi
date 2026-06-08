const Customer = require('../models/Customer');
const Order = require('../models/Order');

// GET /api/customers
const getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { whatsappPhone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [customers, total] = await Promise.all([
      Customer.find(filter).sort({ lastInteraction: -1 }).skip(skip).limit(parseInt(limit)),
      Customer.countDocuments(filter)
    ]);

    res.json({ success: true, count: customers.length, total, page: parseInt(page), data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/customers/:id
const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    const orders = await Order.find({ customer: customer._id })
      .sort({ createdAt: -1 }).limit(10);

    res.json({ success: true, data: { customer, orders } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/customers/:id/block
const toggleBlock = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    customer.isBlocked = !customer.isBlocked;
    await customer.save();
    res.json({
      success: true,
      message: `Customer ${customer.isBlocked ? 'blocked' : 'unblocked'}`,
      data: customer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/customers/:id/broadcast
const sendBroadcast = async (req, res) => {
  try {
    const { message } = req.body;
    const { sendTextMessage } = require('../services/whatsappService');
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    await sendTextMessage(customer.whatsappPhone, message);
    res.json({ success: true, message: 'Message sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/customers/stats
const getCustomerStats = async (req, res) => {
  try {
    const [total, active, newThisMonth] = await Promise.all([
      Customer.countDocuments(),
      Customer.countDocuments({ lastInteraction: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      Customer.countDocuments({ createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } })
    ]);
    res.json({ success: true, data: { total, active, newThisMonth } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCustomers, getCustomer, toggleBlock, sendBroadcast, getCustomerStats };
