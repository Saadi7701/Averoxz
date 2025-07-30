const express = require("express");
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getVendorOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getOrderStats,
  getAllOrders,
} = require("../controllers/orderController");
const {
  protect,
  vendorOnly,
  adminOnly,
  vendorOrAdmin,
} = require("../middleware/authMiddleware");

// Customer routes
router.get("/my-orders", protect, getUserOrders);
router.post("/", protect, createOrder);
router.put("/:id/cancel", protect, cancelOrder);

// Vendor routes
router.get("/vendor/orders", protect, vendorOnly, getVendorOrders);
router.get("/vendor/stats", protect, vendorOnly, getOrderStats);
router.put("/:id/status", protect, vendorOrAdmin, updateOrderStatus);

// Admin routes
router.get("/admin/all", protect, adminOnly, getAllOrders);

// Shared routes (with permission checks in controller)
router.get("/:id", protect, getOrderById);

module.exports = router;
