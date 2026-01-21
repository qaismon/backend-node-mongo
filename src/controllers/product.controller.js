const Product = require("../models/Product.model");

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json({ success: true, message: "Product added" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createProduct = exports.addProduct;

exports.updateProduct = async (req, res) => {
    try {
        await Product.findByIdAndUpdate(req.params.id, req.body);
        res.json({ success: true, message: "Product updated" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Product deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};