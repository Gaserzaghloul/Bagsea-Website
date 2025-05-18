const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  cart: {
    type: Object,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  shipping: {
    method: {
      type: Schema.Types.ObjectId,
      ref: "Shipping",
      required: true
    },
    price: Number,
    deliveryTime: String,
    estimatedDeliveryDate: Date
  },
  tax: {
    rate: Number,
    amount: Number
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    },
    date: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  trackingNumber: String,
  trackingUpdates: [{
    status: String,
    location: String,
    date: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  delivered: {
    type: Boolean,
    default: false
  },
  deliveryDate: Date,
  notes: String
});

// Add status to history when status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      date: new Date()
    });
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
