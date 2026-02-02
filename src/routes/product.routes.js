const express = require("express");
const router = express.Router();

const productController = require("../controllers/product.controller");

const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");


// USER ROUTES
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

// ADMIN ROUTES

router.post('/add', auth, admin, productController.addProduct);
router.post("/", auth, admin, productController.createProduct || productController.addProduct);
router.put("/:id", auth, admin, productController.updateProduct);
router.delete("/:id", auth, admin, productController.deleteProduct);

module.exports = router;