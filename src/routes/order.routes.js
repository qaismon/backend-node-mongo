const express = require("express");
const router = express.Router();

const {
  placeOrder,
  getUserOrders,
  getAllOrders,
   cancelOrder,
  updateOrderStatus,

} = require("../controllers/order.controller");

const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");

// USER
router.post("/", auth, placeOrder);
router.get("/my-orders", auth, getUserOrders);

router.post('/cancel', auth, cancelOrder);

// ADMIN
router.get("/all", auth, admin, getAllOrders);
router.post("/status", auth, admin, updateOrderStatus);

module.exports = router;