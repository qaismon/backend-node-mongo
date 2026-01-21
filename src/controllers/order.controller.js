const Order = require("../models/Order.model");
const User = require("../models/User.model");
const mongoose=require("mongoose")

// 1. Place a new order
exports.placeOrder = async (req, res) => {
  try {
    const { items, amount, payment, upiId, deliveryData } = req.body;
    const userId = req.user.id || req.user._id;

    // 1. Format items to match Schema (especially the product ID)
    const formattedItems = items.map(item => ({
      product: new mongoose.Types.ObjectId(item.product), 
      name: item.name,
      flavor: item.flavor || "Default",
      price: Number(item.price),
      quantity: Number(item.quantity)
    }));

    // 2. Create the order document
    const newOrder = new Order({
      user: new mongoose.Types.ObjectId(userId),
      items: formattedItems,
      amount: Number(amount),
      payment: payment,
      upiId: upiId || null,
      deliveryData: deliveryData,
      status: "Pending", // FIXED: Must match the enum in your model!
    });

    // 3. Save to Database
    await newOrder.save();

    // 4. Clear Cart in DB after successful order
    await User.findByIdAndUpdate(userId, { cartData: {} });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: newOrder._id
    });

  } catch (error) {
    console.error("--- DATABASE SAVE ERROR ---");
    console.error(error); // This will show in your Node terminal
    
    res.status(500).json({ 
      success: false, 
      message: "Database Error: " + error.message 
    });
  }
};
// 2. Get User Orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const orders = await Order.find({ user: userId }).sort({ date: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get All Orders (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate("user", "name email").sort({ date: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Update Status (Admin) - Essential to prevent route crash
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await Order.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id || req.user._id;

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Security: Ensure the user cancelling the order is the one who placed it
    // (Unless they are an admin, which you can check if you have req.user.role)
    if (order.user.toString() !== userId.toString()) {
      return res.status(401).json({ success: false, message: "Unauthorized action" });
    }

    // Logic: Only allow cancellation if order is not already shipped/delivered
    if (order.status === "Shipped" || order.status === "Delivered") {
      return res.status(400).json({ success: false, message: "Cannot cancel order after it has been shipped." });
    }

    // Update status to Cancelled
    order.status = "Cancelled";
    await order.save();

    res.json({ success: true, message: "Order cancelled successfully" });

  } catch (error) {
    console.error("Cancel Order Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};