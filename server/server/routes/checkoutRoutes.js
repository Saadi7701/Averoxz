const express = require("express");
const router = express.Router();
const {
  validateCheckout,
  processCheckout,
  getCheckoutSummary
} = require("../controllers/checkoutController");
const { protect } = require("../middleware/authMiddleware");

// All checkout routes require authentication
router.use(protect);

router.get("/summary", getCheckoutSummary);
router.post("/validate", validateCheckout);
router.post("/process", processCheckout);

module.exports = router;

