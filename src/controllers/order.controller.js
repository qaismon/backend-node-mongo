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
      status: "Pending", 
    });

    await newOrder.save();

    
    await User.findByIdAndUpdate(userId, { cartData: {} });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: newOrder._id
    });

  } catch (error) {
    console.error("--- DATABASE SAVE ERROR ---");
    
    
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
    const orders = await Order.find({})
      .populate('user', 'name email') 
      .sort({ createdAt: -1 }); // Newest first

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Update Status (Admin) 
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

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.user.toString() !== userId.toString()) {
      return res.status(401).json({ success: false, message: "Unauthorized action" });
    }

    if (order.status === "Shipped" || order.status === "Delivered") {
      return res.status(400).json({ success: false, message: "Cannot cancel order after it has been shipped." });
    }

    order.status = "Cancelled";
    await order.save();

    res.json({ success: true, message: "Order cancelled successfully" });

  } catch (error) {
    console.error("Cancel Order Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};