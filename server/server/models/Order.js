const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    }
  }],
  // Order totals
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0
  },
  shipping: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    required: true
  },
  // Shipping information
  shippingAddress: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    phoneNumber: String
  },
  // Billing information
  billingAddress: {
    firstName: String,
    lastName: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phoneNumber: String,
    sameAsShipping: {
      type: Boolean,
      default: true
    }
  },
  // Payment information
  payment: {
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },
  // Order status and tracking
  status: {
    type: String,
    enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"],
    default: "pending",
    index: true
  },
  trackingNumber: String,
  estimatedDelivery: Date,
  deliveredAt: Date,
  // Order timeline
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  // Notes and special instructions
  customerNotes: String,
  vendorNotes: String,
  adminNotes: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
OrderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compound indexes for efficient queries
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ 'items.vendor': 1, createdAt: -1 });
OrderSchema.index({ 'items.store': 1, createdAt: -1 });

module.exports = mongoose.model("Order", OrderSchema);

