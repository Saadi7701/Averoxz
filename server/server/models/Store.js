const mongoose = require("mongoose");

const ImageSchema = {
  data: Buffer,
  contentType: String,
};

const StoreSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: ImageSchema,
    default: {},
  },
  banner: {
    type: ImageSchema,
    default: {},
  },
  frontImage: {
    type: ImageSchema,
    default: {},
  },
  backBanner: {
    type: ImageSchema,
    default: {},
  },
  themeColor: {
    type: String,
    default: "#ffffff",
  },
  fontStyle: {
    type: String,
    default: "default",
  },
  layoutStyle: {
    type: String,
    default: "classic",
  },
  slogan: {
    type: String,
    default: "",
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  contact: {
    phone: {
      type: String,
      required: true,
    },
    email: String,
    website: String,
  },
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
  },
  businessInfo: {
    businessType: String,
    taxId: String,
    registrationNumber: String,
  },
  settings: {
    isActive: {
      type: Boolean,
      default: true,
    },
    allowReviews: {
      type: Boolean,
      default: true,
    },
    autoApproveProducts: {
      type: Boolean,
      default: true,
    },
  },
  stats: {
    totalProducts: {
      type: Number,
      default: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
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

StoreSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

StoreSchema.index({
  name: "text",
  description: "text",
});

module.exports = mongoose.model("Store", StoreSchema);
