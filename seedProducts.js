require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./src/models/Product.model");
const products = require("./products.json");

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    await Product.deleteMany();
    console.log("Old products removed");

    await Product.insertMany(products);
    console.log("Products inserted successfully");

    process.exit();
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedProducts();
