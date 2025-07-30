const express = require("express");
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
} = require("../controllers/notificationController");
const { verifyToken } = require("../middleware/auth");

router.get("/my", verifyToken, getMyNotifications);
router.put("/:id/read", verifyToken, markAsRead);

module.exports = router;
