const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["customer", "vendor", "admin"],
    default: "customer",
  },
  // Enhanced vendor fields
  vendorInfo: {
    storeName: {
      type: String,
      required: function() { return this.role === 'vendor'; }
    },
    storeDescription: {
      type: String,
      required: function() { return this.role === 'vendor'; }
    },
    storeImage: {
      type: String,
      default: ''
    },
    businessAddress: {
      type: String,
      required: function() { return this.role === 'vendor'; }
    },
    phoneNumber: {
      type: String,
      required: function() { return this.role === 'vendor'; }
    },
    isStoreActive: {
      type: Boolean,
      default: true
    }
  },
  // Customer profile enhancements
  customerInfo: {
    firstName: String,
    lastName: String,
    phoneNumber: String,
    addresses: [{
      type: {
        type: String,
        enum: ['home', 'work', 'other'],
        default: 'home'
      },
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      isDefault: {
        type: Boolean,
        default: false
      }
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);

