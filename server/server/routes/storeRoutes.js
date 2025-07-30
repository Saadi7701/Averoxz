const express = require("express");
const router = express.Router();
const {
  createStore,
  getAllStores,
  getStoreByVendor,
  getMyStore,
  updateStore,
  deleteStore,
  getStoreStats,
  uploadStoreImage,
  getStoreImage,
  getStoreBanner,
  getStoreById,
} = require("../controllers/storeController");
const { protect, vendorOnly } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Public routes
router.get("/", getAllStores);
router.get("/my-store-id", protect, vendorOnly, getMyStore);
router.get("/my-store", protect, vendorOnly, getMyStore);
router.get("/vendor/:vendorId", getStoreByVendor);
router.get("/:storeId/image", getStoreImage);
router.get("/:storeId/banner", getStoreBanner);
router.get("/:storeId", getStoreById);

// Protected vendor routes
router.post("/", protect, vendorOnly, createStore);
router.put("/", protect, vendorOnly, updateStore);
router.delete("/", protect, vendorOnly, deleteStore);
router.get("/stats", protect, vendorOnly, getStoreStats);
router.post(
  "/upload-image",
  protect,
  vendorOnly,
  upload.single("image"),
  uploadStoreImage
);

module.exports = router;
