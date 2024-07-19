const Product = require('../models/Product');
exports.createProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Rechercher des produits
exports.searchProducts = async (req, res) => {
    const { query, page = 1, limit = 10 } = req.query;
    try {
        const products = await Product.find({ $text: { $search: query } })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Pagination des produits
exports.paginateProducts = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
        const products = await Product.find()
            .skip((page - 1) * limit)
            .limit(Number(limit));
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const par = req.params.id
        const body = req.body
        const product = await Product.findByIdAndUpdate(par,body);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
