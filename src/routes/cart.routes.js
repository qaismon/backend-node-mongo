const express = require("express");
const router = express.Router();

const {
  addToCart,
  getCart,
  removeFromCart
} = require("../controllers/cart.controller");

const auth = require("../middleware/auth.middleware");

router.get("/", auth, getCart);
router.post("/add", auth, addToCart);
router.post("/remove", auth, removeFromCart);

module.exports = router;
