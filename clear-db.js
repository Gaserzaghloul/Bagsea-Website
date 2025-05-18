const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/product');
const Category = require('./models/category');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost/bags-ecommerce';

async function clearDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('Products and categories collections cleared!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error clearing database:', err);
    process.exit(1);
  }
}

clearDB(); 