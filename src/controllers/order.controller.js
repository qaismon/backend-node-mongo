const Order = require("../models/Order.model");
const User = require("../models/User.model");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Initialize Razorpay Instance
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// --- NEW: RAZORPAY INITIALIZATION ---
exports.placeOrderRazorpay = async (req, res) => {
    try {
        const { amount } = req.body;
        
        // Razorpay expects amount in the smallest currency unit (paise for INR)
        const options = {
            amount: Math.round(Number(amount) * 100), 
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpayInstance.orders.create(options);
        res.json({ success: true, order });

    } catch (error) {
        console.error("Razorpay Order Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- NEW: RAZORPAY VERIFICATION & DB SAVE ---
exports.verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, formData, items, amount } = req.body;
        const userId = req.user.id || req.user._id;

        // 1. Security check: Verify Signature
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({ success: false, message: "Payment verification failed: Invalid Signature" });
        }

        // 2. Format Items (Reusing your logic)
        const formattedItems = items.map(item => ({
            product: new mongoose.Types.ObjectId(item.product),
            name: item.name,
            flavor: item.flavor || "Default",
            price: Number(item.price),
            quantity: Number(item.quantity)
        }));

        // 3. Create Order in Database
        const newOrder = new Order({
            user: new mongoose.Types.ObjectId(userId),
            items: formattedItems,
            amount: Number(amount),
            payment: true, // Mark as paid
            deliveryData: formData,
            status: "Pending",
            date: Date.now()
        });

        await newOrder.save();
        
        // 4. Clear User Cart
        await User.findByIdAndUpdate(userId, { cartData: {} });

        res.status(201).json({ success: true, message: "Order placed and payment verified." });

    } catch (error) {
        console.error("Razorpay Verify Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- ORIGINAL PLACE ORDER (COD / UPI) ---
exports.placeOrder = async (req, res) => {
    try {
        const { items, amount, payment, upiId, deliveryData } = req.body;
        const userId = req.user.id || req.user._id;

        const formattedItems = items.map(item => ({
            product: new mongoose.Types.ObjectId(item.product), 
            name: item.name,
            flavor: item.flavor || "Default",
            price: Number(item.price),
            quantity: Number(item.quantity)
        }));

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

// --- GET USER ORDERS ---
exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const orders = await Order.find({ user: userId }).sort({ date: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- GET ALL ORDERS (ADMIN) ---
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'name email') 
            .sort({ createdAt: -1 }); 

        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- UPDATE STATUS (ADMIN) ---
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        await Order.findByIdAndUpdate(orderId, { status });
        res.json({ success: true, message: "Status Updated" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- CANCEL ORDER ---
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