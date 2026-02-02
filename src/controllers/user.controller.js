const User = require("../models/User.model");

// GET ALL USERS (Admin Only)
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .populate("orders") 
      .sort({ createdAt: -1 });
    
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to retrieve users" });
  }
};

exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body; 

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id, 
      { role }, 
      { new: true }
    ).select("-password");

    res.json({ 
      success: true, 
      message: `User role updated to ${role}`, 
      user: updatedUser 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};