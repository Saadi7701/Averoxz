const User = require("../models/User");
const Product = require("../models/Product");
const Store = require("../models/Store");

exports.getVendorProfile = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id).select("-password");
    if (vendor && vendor.role === "vendor") {
      res.json(vendor);
    } else {
      res.status(404).json({ message: "Vendor not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVendorProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.params.id });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.user._id });
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createVendorStore = async (user, vendorInfo) => {
  const storeData = {
    vendor: user._id,
    name: vendorInfo.storeName,
    description: vendorInfo.storeDescription,
    image: vendorInfo.storeImage || "",
    address: {
      street: vendorInfo.businessAddress,
    },
    contact: {
      phone: vendorInfo.phoneNumber,
      email: user.email,
    },
  };

  const store = await Store.create(storeData);
  return store;
};
