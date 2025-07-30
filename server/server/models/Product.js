const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true, // For search optimization
  },
  description: {
    type: String,
    required: true,
    index: true, // For search optimization
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
    index: true,
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    index: true,
  },
  tags: [
    {
      type: String,
      index: true, // For search optimization
    },
  ],
  images: [
    {
      url: {
        type: String,
        required: false, // Now optional if using buffer
      },
      data: {
        type: Buffer,
        required: false, // For storing image as binary
      },
      contentType: {
        type: String,
        required: false, // MIME type for buffer
      },
      alt: String,
      isPrimary: {
        type: Boolean,
        default: false,
      },
    },
  ],
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true,
    index: true,
  },
  // Inventory management
  inventory: {
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    trackInventory: {
      type: Boolean,
      default: true,
    },
  },
  // Product visibility and status
  status: {
    type: String,
    enum: ["active", "inactive", "hidden", "out_of_stock"],
    default: "active",
    index: true,
  },
  // SEO and search optimization
  slug: {
    type: String,
    unique: true,
    index: true,
  },
  metaTitle: String,
  metaDescription: String,
  // Product specifications
  specifications: [
    {
      name: String,
      value: String,
    },
  ],
  // Pricing options
  pricing: {
    originalPrice: Number,
    salePrice: Number,
    isOnSale: {
      type: Boolean,
      default: false,
    },
    saleStartDate: Date,
    saleEndDate: Date,
  },
  // Shipping information
  shipping: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    shippingClass: String,
    freeShipping: {
      type: Boolean,
      default: false,
    },
  },
  // Ratings and reviews
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  // Product variants (for different sizes, colors, etc.)
  variants: [
    {
      name: String,
      value: String,
      price: Number,
      inventory: Number,
      sku: String,
    },
  ],
  // SEO and analytics
  views: {
    type: Number,
    default: 0,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate slug from name before saving
ProductSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug =
      this.name
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") + // Replace multiple hyphens with single hyphen
      "-" +
      this._id.toString().slice(-6); // Add unique identifier
  }

  // Update pricing based on sale status
  if (this.pricing && this.pricing.isOnSale && this.pricing.salePrice) {
    this.price = this.pricing.salePrice;
  } else if (this.pricing && this.pricing.originalPrice) {
    this.price = this.pricing.originalPrice;
  }

  // Update status based on inventory
  if (this.inventory.trackInventory && this.inventory.quantity === 0) {
    this.status = "out_of_stock";
  }

  this.updatedAt = Date.now();
  next();
});

// Create text index for search functionality
ProductSchema.index({
  name: "text",
  description: "text",
  tags: "text",
});

// Compound indexes for efficient queries
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ vendor: 1, status: 1 });
ProductSchema.index({ store: 1, status: 1 });
ProductSchema.index({ price: 1, status: 1 });
ProductSchema.index({ createdAt: -1, status: 1 });

module.exports = mongoose.model("Product", ProductSchema);
