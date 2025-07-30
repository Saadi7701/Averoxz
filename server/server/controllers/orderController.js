const Order = require("../models/Order");
const Product = require("../models/Product");
const Store = require("../models/Store");

// Create order (handled by checkout controller)
exports.createOrder = async (req, res) => {
  const { items, totalPrice, shippingAddress, billingAddress, paymentMethod } =
    req.body;

  try {
    // Generate unique order number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const order = new Order({
      orderNumber,
      user: req.user.id,
      items,
      totalPrice,
      shippingAddress,
      billingAddress: billingAddress || {
        ...shippingAddress,
        sameAsShipping: true,
      },
      payment: {
        method: paymentMethod,
        status: "pending",
      },
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date(),
          note: "Order created",
        },
      ],
    });

    const createdOrder = await order.save();

    const populatedOrder = await Order.findById(createdOrder._id)
      .populate("items.product", "name images")
      .populate("items.vendor", "username email")
      .populate("items.store", "name");

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's orders (customer)
exports.getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: req.user.id };
    if (status) {
      query.status = { $in: status.split(",") };
    }

    const orders = await Order.find(query)
      .populate("items.product", "name images")
      .populate("items.vendor", "username")
      .populate("items.store", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get vendor's orders
exports.getVendorOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { "items.vendor": req.user.id };
    if (status) {
      query.status = { $in: status.split(",") };
    }

    const orders = await Order.find(query)
      .populate("user", "username email")
      .populate("items.product", "name images")
      .populate("items.store", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Filter items to only show vendor's products
    const filteredOrders = orders.map((order) => ({
      ...order.toObject(),
      items: order.items.filter(
        (item) => item.vendor.toString() === req.user.id
      ),
    }));

    const total = await Order.countDocuments(query);

    res.json({
      orders: filteredOrders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "username email")
      .populate("items.product", "name images")
      .populate("items.vendor", "username email")
      .populate("items.store", "name");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user has permission to view this order
    const isOwner = order.user._id.toString() === req.user.id;
    const isVendor = order.items.some(
      (item) => item.vendor._id.toString() === req.user.id
    );
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isVendor && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this order" });
    }

    // If vendor, filter items to only show their products
    if (isVendor && !isOwner && !isAdmin) {
      order.items = order.items.filter(
        (item) => item.vendor._id.toString() === req.user.id
      );
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status (vendor/admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check permissions
    const isVendor = order.items.some(
      (item) => item.vendor.toString() === req.user.id
    );
    const isAdmin = req.user.role === "admin";

    if (!isVendor && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this order" });
    }

    // Validate status transition
    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Update order
    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    // Add to status history
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Order status updated to ${status}`,
    });

    // Set delivery date if delivered
    if (status === "delivered") {
      order.deliveredAt = new Date();
    }

    const updatedOrder = await order.save();

    const populatedOrder = await Order.findById(updatedOrder._id)
      .populate("user", "username email")
      .populate("items.product", "name images")
      .populate("items.vendor", "username email")
      .populate("items.store", "name");

    res.json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel order (customer)
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this order" });
    }

    // Check if order can be cancelled
    if (!["pending", "confirmed"].includes(order.status)) {
      return res
        .status(400)
        .json({ message: "Order cannot be cancelled at this stage" });
    }

    // Update order status
    order.status = "cancelled";
    order.statusHistory.push({
      status: "cancelled",
      timestamp: new Date(),
      note: "Order cancelled by customer",
    });

    // Restore inventory
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product && product.inventory.trackInventory) {
        product.inventory.quantity += item.quantity;
        if (
          product.status === "out_of_stock" &&
          product.inventory.quantity > 0
        ) {
          product.status = "active";
        }
        await product.save();
      }
    }

    const updatedOrder = await order.save();

    const populatedOrder = await Order.findById(updatedOrder._id)
      .populate("items.product", "name images")
      .populate("items.vendor", "username")
      .populate("items.store", "name");

    res.json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order statistics (vendor)
exports.getOrderStats = async (req, res) => {
  try {
    const vendorId = req.user.id;

    // Get total orders for vendor
    const totalOrders = await Order.countDocuments({
      "items.vendor": vendorId,
    });

    // Get orders by status
    const statusStats = await Order.aggregate([
      { $match: { "items.vendor": vendorId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Get revenue statistics
    const revenueStats = await Order.aggregate([
      {
        $match: {
          "items.vendor": vendorId,
          status: { $in: ["delivered", "shipped"] },
        },
      },
      { $unwind: "$items" },
      { $match: { "items.vendor": vendorId } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$items.totalPrice" },
          averageOrderValue: { $avg: "$items.totalPrice" },
        },
      },
    ]);

    // Get recent orders
    const recentOrders = await Order.find({ "items.vendor": vendorId })
      .populate("user", "username")
      .populate("items.product", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalOrders,
      statusStats,
      revenue: revenueStats[0] || { totalRevenue: 0, averageOrderValue: 0 },
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const query = {};
    if (status) {
      query.status = { $in: status.split(",") };
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "shippingAddress.firstName": { $regex: search, $options: "i" } },
        { "shippingAddress.lastName": { $regex: search, $options: "i" } },
      ];
    }

    const orders = await Order.find(query)
      .populate("user", "username email")
      .populate("items.product", "name")
      .populate("items.vendor", "username")
      .populate("items.store", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
