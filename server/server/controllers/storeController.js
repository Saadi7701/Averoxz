const Store = require("../models/Store");

// 1x1 black PNG buffer (base64 decoded)
const BLACK_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+Xw1cAAAAASUVORK5CYII=",
  "base64"
);

// ========== Create Store ==========
exports.createStore = async (req, res) => {
  try {
    const { name, description } = req.body;

    const existing = await Store.findOne({ vendor: req.user._id });
    if (existing)
      return res.status(400).json({ message: "Store already exists" });

    const storeData = {
      name,
      description,
      vendor: req.user._id,
    };

    // Defensive check: Prevent setting invalid image values
    ["banner", "image", "frontImage", "backBanner"].forEach((field) => {
      if (req.body[field] && typeof req.body[field] === "object") {
        storeData[field] = req.body[field];
      }
    });

    const store = new Store(storeData);
    await store.save();
    res.status(201).json(store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== Get All Stores ==========
exports.getAllStores = async (req, res) => {
  try {
    const stores = await Store.find().populate("vendor", "name email");
    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== Get Store By Vendor ==========
exports.getStoreByVendor = async (req, res) => {
  try {
    const store = await Store.findOne({ vendor: req.params.vendorId }).populate(
      "vendor",
      "name email"
    );
    if (!store) return res.status(404).json({ message: "Store not found" });
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== Get My Store ==========
exports.getMyStore = async (req, res) => {
  try {
    const store = await Store.findOne({ vendor: req.user._id });
    if (!store) return res.status(404).json({ message: "Store not found" });
    res.json({ storeId: store._id, store });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== Update Store ==========
exports.updateStore = async (req, res) => {
  try {
    const updates = { ...req.body };

    // Defensive: Remove invalid banner/image fields
    ["banner", "image", "frontImage", "backBanner"].forEach((field) => {
      if (typeof updates[field] === "string" || updates[field] === null) {
        delete updates[field];
      }
    });

    const store = await Store.findOneAndUpdate(
      { vendor: req.user._id },
      updates,
      { new: true }
    );
    if (!store) return res.status(404).json({ message: "Store not found" });
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== Delete Store ==========
exports.deleteStore = async (req, res) => {
  try {
    const store = await Store.findOneAndDelete({ vendor: req.user._id });
    if (!store) return res.status(404).json({ message: "Store not found" });
    res.json({ message: "Store deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== Get Store Stats ==========
exports.getStoreStats = async (req, res) => {
  try {
    // Example: count products, orders, etc. for the vendor's store
    const store = await Store.findOne({ vendor: req.user._id });
    if (!store) return res.status(404).json({ message: "Store not found" });

    // Dummy stats, replace with your logic
    const stats = {
      products: 0,
      orders: 0,
      // Add more as needed
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== Image Upload ==========
// ========== Image Upload ==========
exports.uploadStoreImage = async (req, res) => {
  try {
    const { type } = req.body;

    if (!req.file || !type) {
      return res
        .status(400)
        .json({ message: "Image file and type are required" });
    }

    const allowedTypes = ["image", "banner", "frontImage", "backBanner"];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid image type" });
    }

    const store = await Store.findOne({ vendor: req.user._id });
    if (!store) return res.status(404).json({ message: "Store not found" });

    // Dynamically assign to the correct field
    store[type] = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    };

    await store.save();
    res.json({ message: `${type} uploaded successfully` });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({ message: error.message || "Image upload failed" });
  }
};

// ========== Get Store Image ==========
exports.getStoreImage = async (req, res) => {
  try {
    const store = await Store.findById(req.params.storeId);
    if (!store || !store.image || !store.image.data) {
      res.set("Content-Type", "image/png");
      return res.send(BLACK_PNG);
    }
    res.set("Content-Type", store.image.contentType);
    res.send(store.image.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== Get Store Banner ==========
exports.getStoreBanner = async (req, res) => {
  try {
    const store = await Store.findById(req.params.storeId);
    if (!store || !store.banner || !store.banner.data) {
      res.set("Content-Type", "image/png");
      return res.send(BLACK_PNG);
    }
    res.set("Content-Type", store.banner.contentType);
    res.send(store.banner.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== Get Store By ID ==========
exports.getStoreById = async (req, res) => {
  try {
    console.log("Requested storeId:", req.params.storeId);
    const store = await Store.findById(req.params.storeId)
      .populate("vendor", "name email")
      .select("-image.data -frontImage.data -backBanner.data");
    if (!store) {
      console.log("Store not found for ID:", req.params.storeId);
      return res.status(404).json({ message: "Store not found" });
    }
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
