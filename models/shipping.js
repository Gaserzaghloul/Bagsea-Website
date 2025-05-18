const mongoose = require('mongoose');

const shippingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  deliveryTime: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: 'ALL', // 'ALL' means applies to all countries unless overridden
  },
  region: {
    type: String,
    default: '', // e.g., 'CA' for California, or '' for all regions
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Shipping', shippingSchema); 