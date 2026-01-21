require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./src/models/User.model");
const users = require("./users.json");

const seedUsers = async () => {
  try {
    // 1️⃣ Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // 2️⃣ Clear existing users (optional but recommended)
    await User.deleteMany();
    console.log("Old users removed");

    // 3️⃣ Insert users
    for (const u of users) {
      const hashedPassword = await bcrypt.hash(u.password, 10);

      await User.create({
        legacyId: u.legacyId,
        name: u.name,
        email: u.email,
        password: hashedPassword,
        cart: u.cart || {},
        orders: u.orders || [],
        role: u.role || "user",
        defaultAddress: u.defaultAddress ?? null
      });

      console.log(`Seeded user: ${u.email}`);
    }

    console.log("✅ Users seeded successfully");
    process.exit();
  } catch (error) {
    console.error("❌ User seeding error:", error);
    process.exit(1);
  }
};

seedUsers();
