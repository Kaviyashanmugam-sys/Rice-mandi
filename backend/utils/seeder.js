require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Settings = require('../models/Settings');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Admin user
  const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (!adminExists) {
    await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@ricemandi.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'admin'
    });
    console.log('✅ Admin user created');
  }

  // Default settings
  const defaultSettings = [
    { key: 'shopName', value: 'Rice Mandi', group: 'shop', description: 'Shop name' },
    { key: 'shopPhone', value: '+919876543210', group: 'shop', description: 'Shop phone' },
    { key: 'freeDeliveryAbove', value: 1000, group: 'delivery', description: 'Free delivery above this amount (₹)' },
    { key: 'deliveryCharge', value: 50, group: 'delivery', description: 'Delivery charge for orders below threshold (₹)' },
    { key: 'upiId', value: 'ricemandi@upi', group: 'payment', description: 'UPI ID for payments' },
    { key: 'bankAccount', value: 'XXXX XXXX XXXX 1234', group: 'payment', description: 'Bank account number' },
  ];
  for (const s of defaultSettings) {
    await Settings.findOneAndUpdate({ key: s.key }, s, { upsert: true });
  }
  console.log('✅ Default settings seeded');

  // Categories
  const categories = [
    { name: 'Rice', nameInTamil: 'அரிசி', icon: '🌾', description: 'All types of rice', sortOrder: 1 },
    { name: 'Dal', nameInTamil: 'பருப்பு', icon: '🫘', description: 'Lentils and pulses', sortOrder: 2 },
    { name: 'Uzhundhu', nameInTamil: 'உழுந்து', icon: '🌑', description: 'Black gram and varieties', sortOrder: 3 },
    { name: 'Oil', nameInTamil: 'எண்ணெய்', icon: '🧴', description: 'Cooking oils', sortOrder: 4 },
    { name: 'Spices', nameInTamil: 'மசாலா', icon: '🌶️', description: 'Spices and masala', sortOrder: 5 },
    { name: 'Other Groceries', nameInTamil: 'மளிகை', icon: '🛒', description: 'Other grocery items', sortOrder: 6 },
  ];

  const savedCategories = {};
  for (const cat of categories) {
    const saved = await Category.findOneAndUpdate(
      { name: cat.name },
      cat,
      { upsert: true, new: true }
    );
    savedCategories[cat.name] = saved._id;
  }
  console.log('✅ Categories seeded');

  // Products
  const products = [
    // Rice
    { name: 'Ponni Raw Rice', nameInTamil: 'பொன்னி அரிசி', category: savedCategories['Rice'], price: 55, unit: 'kg', stockQuantity: 500, quantityOptions: [1, 2, 5, 10, 25, 50] },
    { name: 'Sona Masoori Rice', nameInTamil: 'சோனா மசூரி அரிசி', category: savedCategories['Rice'], price: 65, unit: 'kg', stockQuantity: 300, quantityOptions: [1, 2, 5, 10, 25] },
    { name: 'Basmati Rice', nameInTamil: 'பாஸ்மதி அரிசி', category: savedCategories['Rice'], price: 120, unit: 'kg', stockQuantity: 150, quantityOptions: [1, 2, 5, 10] },
    { name: 'Idli Rice', nameInTamil: 'இட்லி அரிசி', category: savedCategories['Rice'], price: 48, unit: 'kg', stockQuantity: 400, quantityOptions: [1, 2, 5, 10, 25] },
    { name: 'Red Raw Rice', nameInTamil: 'கெட்டி அரிசி', category: savedCategories['Rice'], price: 72, unit: 'kg', stockQuantity: 200, quantityOptions: [1, 2, 5, 10] },
    // Dal
    { name: 'Toor Dal', nameInTamil: 'துவரம் பருப்பு', category: savedCategories['Dal'], price: 130, unit: 'kg', stockQuantity: 200, quantityOptions: [0.5, 1, 2, 5] },
    { name: 'Moong Dal', nameInTamil: 'பாசிப்பருப்பு', category: savedCategories['Dal'], price: 110, unit: 'kg', stockQuantity: 150 },
    { name: 'Chana Dal', nameInTamil: 'கடலைப்பருப்பு', category: savedCategories['Dal'], price: 90, unit: 'kg', stockQuantity: 180 },
    { name: 'Masoor Dal', nameInTamil: 'மசூர் பருப்பு', category: savedCategories['Dal'], price: 100, unit: 'kg', stockQuantity: 120 },
    // Uzhundhu
    { name: 'Urad Dal Whole', nameInTamil: 'முழு உழுந்து', category: savedCategories['Uzhundhu'], price: 120, unit: 'kg', stockQuantity: 150 },
    { name: 'Urad Dal Split', nameInTamil: 'உழுந்தம் பருப்பு', category: savedCategories['Uzhundhu'], price: 140, unit: 'kg', stockQuantity: 100 },
    { name: 'Black Urad Dal', nameInTamil: 'கருப்பு உழுந்து', category: savedCategories['Uzhundhu'], price: 115, unit: 'kg', stockQuantity: 80 },
    // Oil
    { name: 'Groundnut Oil', nameInTamil: 'கடலை எண்ணெய்', category: savedCategories['Oil'], price: 185, unit: 'litre', stockQuantity: 100, quantityOptions: [0.5, 1, 2, 5] },
    { name: 'Sesame Oil', nameInTamil: 'நல்லெண்ணெய்', category: savedCategories['Oil'], price: 250, unit: 'litre', stockQuantity: 60, quantityOptions: [0.5, 1, 2] },
    { name: 'Coconut Oil', nameInTamil: 'தேங்காய் எண்ணெய்', category: savedCategories['Oil'], price: 220, unit: 'litre', stockQuantity: 80, quantityOptions: [0.5, 1, 2, 5] },
    { name: 'Sunflower Oil', nameInTamil: 'சூரியகாந்தி எண்ணெய்', category: savedCategories['Oil'], price: 160, unit: 'litre', stockQuantity: 120, quantityOptions: [1, 2, 5] },
  ];

  for (const prod of products) {
    await Product.findOneAndUpdate(
      { name: prod.name },
      { ...prod, isAvailable: true },
      { upsert: true }
    );
  }
  console.log(`✅ ${products.length} products seeded`);

  console.log('\n🎉 Database seeded successfully!');
  console.log(`📧 Admin Email: ${process.env.ADMIN_EMAIL || 'admin@ricemandi.com'}`);
  console.log(`🔑 Admin Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
