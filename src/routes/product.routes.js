const express = require("express");
const router = express.Router();

// Import Controller Functions
const productController = require("../controllers/product.controller");

// Import Middleware - NO CURLY BRACES
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");

// DEBUGGING: This will print in your terminal so we can see which one is undefined
console.log("--- ROUTE DEPENDENCY CHECK ---");
console.log("auth is:", typeof auth);
console.log("admin is:", typeof admin);
console.log("addProduct is:", typeof productController.addProduct);
console.log("------------------------------");

// USER ROUTES
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

// ADMIN ROUTES
// We use productController.name to ensure we are grabbing the function correctly
router.post('/add', auth, admin, productController.addProduct);
router.post("/", auth, admin, productController.createProduct || productController.addProduct);
router.put("/:id", auth, admin, productController.updateProduct);
router.delete("/:id", auth, admin, productController.deleteProduct);

module.exports = router;