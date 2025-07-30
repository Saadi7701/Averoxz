const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductVisibility,
  getVendorProducts,
  searchProducts,
  getProductsByCategory,
} = require("../controllers/productController");
const {
  protect,
  vendorOnly,
  checkResourceOwnership,
} = require("../middleware/authMiddleware");
const Product = require("../models/Product");

// Public routes
router.get("/", getProducts);
router.get("/search", searchProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:id", getProductById);

// Protected vendor routes
router.post("/", protect, vendorOnly, createProduct);
router.get("/vendor/my-products", protect, vendorOnly, getVendorProducts);
router.put(
  "/:id",
  protect,
  checkResourceOwnership(Product, "vendor"),
  updateProduct
);
router.delete(
  "/:id",
  protect,
  checkResourceOwnership(Product, "vendor"),
  deleteProduct
);
router.patch(
  "/:id/toggle-visibility",
  protect,
  vendorOnly,
  toggleProductVisibility
);

module.exports = router;
