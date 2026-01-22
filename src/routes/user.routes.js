const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const User = require("../models/User.model");
const { listUsers, deleteUser, updateUserRole} = require("../controllers/user.controller");
const admin = require("../middleware/admin.middleware");


router.get('/list',auth, admin, listUsers);
router.delete('/:id', auth, admin, deleteUser)
router.patch("/update-role/:id", auth, admin, updateUserRole);
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      cart: user.cart || {},
      orders: user.orders || [],
      defaultAddress: user.defaultAddress || null,
    });
  } catch (err) {
    console.error("GET /users/me error:", err);
    res.status(500).json({ message: "Failed to load user data" });
  }
});

router.patch("/cart", auth, async (req, res) => {
  try {
    const { cart } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cart = cart;
    user.markModified('cart'); 
    await user.save();

    res.json({ success: true, cart: user.cart });
  } catch (err) {
    console.error("PATCH /users/cart error:", err);
    res.status(500).json({ message: "Failed to update cart" });
  }
});


module.exports = router;
