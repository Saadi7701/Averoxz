const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
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
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    price: {
      type: Number,
      required: true // Store price at time of adding to cart
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalItems: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: 2592000 // 30 days
  }
});

// Calculate totals before saving
CartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  this.lastModified = Date.now();
  
  // Reset expiration
  this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
  
  next();
});

// Index for efficient queries
CartSchema.index({ user: 1, lastModified: -1 });

module.exports = mongoose.model("Cart", CartSchema);

