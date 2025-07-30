const Product = require("../models/Product");
const Store = require("../models/Store");
const Category = require("../models/Category");

// Get all products (public with filtering and search)
exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      vendor,
      storeId, // Accept storeId from query
      store, // Also accept store for backward compatibility
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      sortOrder = "desc",
      status = "active",
    } = req.query;

    const query = { status: { $in: status.split(",") } };

    // Add search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Add filters
    if (category) query.category = category;
    if (vendor) query.vendor = vendor;

    // --- MAIN FIX: filter by storeId or store ---
    if (storeId) query.store = storeId;
    else if (store) query.store = store;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const products = await Product.find(query)
      .populate("vendor", "username email")
      .populate("store", "name")
      .populate("category", "name slug")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get product by ID (public)
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("vendor", "username email")
      .populate("store", "name description image")
      .populate("category", "name slug")
      .populate("subcategory", "name slug");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Increment view count
    product.views += 1;
    await product.save();

    // Get related products from same category
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      status: "active",
    })
      .populate("vendor", "username")
      .populate("store", "name")
      .limit(6);

    res.json({
      product,
      relatedProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create product (vendor only)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, imageUrl } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        message:
          "Missing required fields: name, description, price, and category are required",
      });
    }

    // Get vendor's store
    const store = await Store.findOne({ vendor: req.user.id });
    // Remove the restriction: do not return error if no store

    // Verify category exists and is a valid ObjectId
    if (!category.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "Invalid category ID format",
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        message: "Category not found. Please select a valid category.",
      });
    }

    // Create product with simplified structure
    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      category,
      vendor: req.user.id,
      store: store ? store._id : null, // Allow null if no store
      inventory: {
        quantity: parseInt(stock) || 0,
        trackInventory: true,
      },
      images: imageUrl
        ? [
            {
              url: imageUrl,
              isPrimary: true,
            },
          ]
        : [],
      status: "active",
    });

    const createdProduct = await product.save();

    // Update store product count only if store exists
    if (store) {
      store.stats.totalProducts += 1;
      await store.save();
    }

    const populatedProduct = await Product.findById(createdProduct._id)
      .populate("vendor", "username email")
      .populate("store", "name")
      .populate("category", "name slug");

    res.status(201).json(populatedProduct);
  } catch (error) {
    console.error("Product creation error:", error);

    // Handle specific MongoDB errors
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid category ID. Please select a valid category.",
      });
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Validation error: " + errors.join(", "),
      });
    }

    res.status(500).json({
      message: "Failed to create product. Please try again.",
    });
  }
};

// Update product (vendor only - own products)
exports.updateProduct = async (req, res) => {
  try {
    Object.assign(req.resource, req.body);
    await req.resource.save();
    res.json(req.resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete product (vendor only - own products)
exports.deleteProduct = async (req, res) => {
  try {
    if (!req.resource) {
      return res.status(404).json({ message: "Product not found" });
    }
    await req.resource.constructor.findByIdAndDelete(req.resource._id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Hide/Show product (vendor only - own products)
exports.toggleProductVisibility = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user owns this product
    if (product.vendor.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to modify this product" });
    }

    // Toggle between active and hidden
    product.status = product.status === "active" ? "hidden" : "active";

    const updatedProduct = await product.save();

    const populatedProduct = await Product.findById(updatedProduct._id)
      .populate("vendor", "username email")
      .populate("store", "name")
      .populate("category", "name slug");

    res.json(populatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get vendor's products
exports.getVendorProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      status,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = { vendor: req.user.id };

    if (status) {
      query.status = { $in: status.split(",") };
    }

    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const products = await Product.find(query)
      .populate("category", "name slug")
      .populate("store", "name")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Product.countDocuments(query);

    // Get status counts
    const statusCounts = await Product.aggregate([
      { $match: { vendor: req.user.id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      statusCounts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search products (public)
exports.searchProducts = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, page = 1, limit = 12 } = req.query;

    const query = { status: "active" };
    let products = [];
    let total = 0;
    let usedTextSearch = false;

    if (q) {
      // First, try $text search for exact word matches
      query.$text = { $search: `\"${q}\"` };
      products = await Product.find(query, { score: { $meta: "textScore" } })
        .populate("vendor", "username")
        .populate("store", "name")
        .populate("category", "name slug")
        .sort({ score: { $meta: "textScore" }, createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
      total = await Product.countDocuments(query);
      usedTextSearch = true;
      // If no results, fallback to regex for partial matches
      if (products.length === 0) {
        delete query.$text;
        query.$or = [
          { name: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
          { tags: { $regex: q, $options: "i" } },
        ];
        products = await Product.find(query)
          .populate("vendor", "username")
          .populate("store", "name")
          .populate("category", "name slug")
          .sort({ createdAt: -1 })
          .limit(limit * 1)
          .skip((page - 1) * limit)
          .exec();
        total = await Product.countDocuments(query);
        usedTextSearch = false;
      }
    } else {
      if (category) query.category = category;
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
      }
      products = await Product.find(query)
        .populate("vendor", "username")
        .populate("store", "name")
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
      total = await Product.countDocuments(query);
    }

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      searchQuery: q,
      usedTextSearch,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get products by category (public)
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const {
      page = 1,
      limit = 12,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {
      category: categoryId,
      status: "active",
    };

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const products = await Product.find(query)
      .populate("vendor", "username")
      .populate("store", "name")
      .populate("category", "name slug")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Product.countDocuments(query);
    const category = await Category.findById(categoryId);

    res.json({
      products,
      category,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
