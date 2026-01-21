const User = require("../models/User.model");

// GET ALL USERS (Admin Only)
exports.listUsers = async (req, res) => {
  try {
    // We select("-password") so we don't send sensitive hashes to the frontend
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      users 
    });
  } catch (error) {
    console.error("List Users Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to retrieve users" 
    });
  }
};