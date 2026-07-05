const Product = require("../models/Products");
const User = require("../models/User");
const Order = require("../models/Order");

// HOME PAGE
const getHome = async (req, res) => {
    try {
        const products = await Product.find().sort({ _id: -1 }).limit(4);

        res.render("home", { products });

    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
};

// LOGIN PAGE
const getLoginPage = (req, res) => {
    res.render("login");
};

// REGISTER PAGE
const getRegisterPage = (req, res) => {
    res.render("register");
};

// SHOP / PRODUCTS PAGE (with search)
const getShopPage = async (req, res) => {
    try {
        const searchQuery = req.query.search;

        let filter = {};

        if (searchQuery) {
            filter = {
                name: { $regex: searchQuery, $options: "i" }
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

// PRODUCT DETAILS PAGE
const getProductDetailsPage = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).send("Product not found");
        }

        res.render("product-details", { product });

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
};

// ORDER SUCCESS PAGE
const getOrderSuccessPage = (req, res) => {
    res.render("order-success");
};

// ADMIN DASHBOARD
const getDashboard = async (req, res) => {
    try {

        const products = await Product.find();

        const totalProducts = await Product.countDocuments();

        const totalUsers = await User.countDocuments();

        const totalOrders = await Order.countDocuments();

        const orders = await Order.find();

        let revenue = 0;

        orders.forEach(order => {

            revenue += order.totalAmount;

        });

        res.render("dashboard", {

            products,

            totalProducts,

            totalUsers,

            totalOrders,

            revenue

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).send("Server Error");

    }

};

// ADD PRODUCT PAGE
const getAddProductPage = (req, res) => {
    res.render("add-product");
};

module.exports = {
    getHome,
    getLoginPage,
    getRegisterPage,
    getShopPage,
    getProductDetailsPage,
    getOrderSuccessPage,
    getDashboard,
    getAddProductPage
};
