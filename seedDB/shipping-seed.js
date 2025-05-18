const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Shipping = require('../models/shipping');
const mongoose = require('mongoose');
const connectDB = require('./../config/db');
connectDB();

async function seedDB() {
  try {
    // Clear existing shipping methods
    await Shipping.deleteMany({}); // Awel haga hn Clear el collection before seeding

    // Add new shipping methods
    const shippingMethods = [
      {
        name: 'Standard Shipping',
        price: 5.99,
        deliveryTime: '3-5 business days',
        isActive: true
      },
      {
        name: 'Express Shipping',
        price: 12.99,
        deliveryTime: '1-2 business days',
        isActive: true
      },
      {
        name: 'Overnight Shipping',
        price: 24.99,
        deliveryTime: 'Next business day',
        isActive: true
      }
    ];

    await Shipping.insertMany(shippingMethods); // Insert the shipping methods into the databaseeeeee
    console.log('Shipping methods seeded successfully');
  } catch (error) {
    console.error('Error seeding shipping methods:', error);
  } finally {
    await mongoose.disconnect(); //after seeding, close the connection
  }
}

seedDB(); 