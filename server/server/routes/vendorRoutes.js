const express = require("express");
const router = express.Router();
const {
  getVendorProfile,
  getVendorProducts,
  getMyProducts,
} = require("../controllers/vendorController");
const { protect } = require("../middleware/authMiddleware");

// Place this route first so it is matched before /:id/products
router.get("/me/products", protect, getMyProducts);

router.get("/:id", getVendorProfile);
router.get("/:id/products", getVendorProducts);

module.exports = router;
