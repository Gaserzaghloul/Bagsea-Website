const mongoose = require('mongoose');
const Order = require('./models/order');
const User = require('./models/user');
const Shipping = require('./models/shipping');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost/bags-ecommerce';

async function checkOrders() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const orders = await Order.find().populate('user').populate('shipping.method');
    if (orders.length === 0) {
      console.log('No orders found in the database.');
    } else {
      console.log('Orders found:', orders.length);
      orders.forEach((order, idx) => {
        console.log(`Order #${idx + 1}:`);
        console.log('  ID:', order._id);
        console.log('  User:', order.user ? order.user.email : 'MISSING USER');
        console.log('  Shipping Method:', order.shipping && order.shipping.method ? order.shipping.method.name : 'MISSING SHIPPING');
        console.log('  Total Amount:', order.totalAmount);
      });
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error checking orders:', err);
    process.exit(1);
  }
}

checkOrders(); 