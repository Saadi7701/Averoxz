const express = require("express");
const router = express.Router();
const {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryHierarchy,
  updateProductCounts,
} = require("../controllers/categoryController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getCategories);
router.get("/hierarchy", getCategoryHierarchy);
router.get("/:slug", getCategoryBySlug);

// Admin routes
router.post("/", protect, adminOnly, createCategory);
router.put("/:id", protect, adminOnly, updateCategory);
router.delete("/:id", protect, adminOnly, deleteCategory);
router.post("/update-counts", protect, adminOnly, updateProductCounts);

module.exports = router;
