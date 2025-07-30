const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Store = require("../models/Store");

// Calculate order totals
const calculateOrderTotals = (items, shippingCost = 0, taxRate = 0.08) => {
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const tax = subtotal * taxRate;
  const total = subtotal + tax + shippingCost;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    shipping: shippingCost,
    total: Math.round(total * 100) / 100,
  };
};

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp.slice(-6)}-${random}`;
};

// Validate checkout (stub)
exports.validateCheckout = async (req, res) => {
  res.status(200).json({ message: "Checkout validated (stub)" });
};

// Get checkout summary (stub)
exports.getCheckoutSummary = async (req, res) => {
  res.status(200).json({ message: "Checkout summary (stub)" });
};

// Process checkout
exports.processCheckout = async (req, res) => {
  try {
    const { shippingAddress, billingAddress, paymentMethod, customerNotes } =
      req.body;
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    // Validate and prepare order items
    const orderItems = [];
    const inventoryUpdates = [];
    for (const item of cart.items) {
      if (!item.product || item.product.status !== "active") {
        return res.status(400).json({
          message: `Product ${item.product?.name || "unknown"} is no longer available`,
        });
      }
      // Check inventory
      if (
        item.product.inventory.trackInventory &&
        item.product.inventory.quantity < item.quantity
      ) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${item.product.name}` });
      }
      orderItems.push({
        product: item.product._id,
        vendor: item.product.vendor,
        store: item.product.store,
        quantity: item.quantity,
        price: item.product.price,
        totalPrice: item.product.price * item.quantity,
      });
      // Prepare inventory update
      if (item.product.inventory.trackInventory) {
        inventoryUpdates.push({
          productId: item.product._id,
          newQuantity: item.product.inventory.quantity - item.quantity,
        });
      }
    }
    // Calculate totals
    const totals = calculateOrderTotals(orderItems);
    // Create order
    const order = new Order({
      orderNumber: generateOrderNumber(),
      user: req.user.id,
      items: orderItems,
      subtotal: totals.subtotal,
      tax: totals.tax,
      shipping: totals.shipping,
      totalPrice: totals.total,
      shippingAddress,
      billingAddress: billingAddress || {
        ...shippingAddress,
        sameAsShipping: true,
      },
      payment: {
        method: paymentMethod,
        status: "pending",
      },
      customerNotes: customerNotes || "",
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date(),
          note: "Order created",
        },
      ],
    });
    await order.save();
    // Update inventory
    for (const update of inventoryUpdates) {
      await Product.findByIdAndUpdate(update.productId, {
        "inventory.quantity": update.newQuantity,
        $inc: { "inventory.reserved": 0 },
      });
      // Update status to out_of_stock if quantity is 0
      const product = await Product.findById(update.productId);
      if (product.inventory.quantity === 0) {
        product.status = "out_of_stock";
        await product.save();
      }
    }
    // Update store statistics
    const storeUpdates = {};
    orderItems.forEach((item) => {
      if (!storeUpdates[item.store]) {
        storeUpdates[item.store] = { orders: 0, revenue: 0 };
      }
      storeUpdates[item.store].orders += 1;
      storeUpdates[item.store].revenue += item.totalPrice;
    });
    for (const [storeId, stats] of Object.entries(storeUpdates)) {
      await Store.findByIdAndUpdate(storeId, {
        $inc: {
          "stats.totalOrders": stats.orders,
          "stats.totalRevenue": stats.revenue,
        },
      });
    }
    // Clear cart
    cart.items = [];
    await cart.save();
    // Populate order for response
    const populatedOrder = await Order.findById(order._id)
      .populate({ path: "items.product", select: "name images" })
      .populate({ path: "items.vendor", select: "username email" })
      .populate({ path: "items.store", select: "name" });
    res
      .status(201)
      .json({ message: "Order placed successfully", order: populatedOrder });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
};
