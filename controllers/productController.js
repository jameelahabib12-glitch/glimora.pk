const Product = require("../models/Products");

// SHOW ALL PRODUCTS
const getAllProductsPage = async (req, res) => {
    try {
        const searchQuery = req.query.search || "";

        let filter = {};

        if (searchQuery) {
            filter = {
                name: {
                    $regex: searchQuery,
                    $options: "i"
                }
            };
        }

        const products = await Product.find(filter);

        res.render("products", {
            products,
            searchQuery
        });

    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
};

// CREATE PRODUCT
const createProduct = async (req, res) => {
    try {

        const {
            name,
            description,
            price,
            stock,
            image1,
            image2,
            image3,
            image4
        } = req.body;

        const images = [
            image1,
            image2,
            image3,
            image4
        ].filter(img => img && img.trim() !== "");

        await Product.create({
            name,
            description,
            price,
            stock,
            images
        });

        res.redirect(303, "/dashboard");

    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
};

// EDIT PAGE
const getEditProductPage = async (req, res) => {
    try {

        const product = await Product.findById(req.params.id);

        res.render("edit-product", {
            product
        });

    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
};

// UPDATE PRODUCT
const updateProduct = async (req, res) => {
    try {

        const {
            name,
            description,
            price,
            stock,
            image1,
            image2,
            image3,
            image4
        } = req.body;

        const images = [
            image1,
            image2,
            image3,
            image4
        ].filter(img => img && img.trim() !== "");

        await Product.findByIdAndUpdate(req.params.id, {
            name,
            description,
            price,
            stock,
            images
        });

        res.redirect(303, "/dashboard");

    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
};

// DELETE PRODUCT
const deleteProduct = async (req, res) => {
    try {

        await Product.findByIdAndDelete(req.params.id);

        res.redirect(303, "/dashboard");

    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
};

module.exports = {
    getAllProductsPage,
    createProduct,
    getEditProductPage,
    updateProduct,
    deleteProduct
};