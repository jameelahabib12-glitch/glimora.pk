const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middleware/auth");

const {
    getHome,
    getLoginPage,
    getRegisterPage,
    getShopPage,
    getProductDetailsPage,
    getOrderSuccessPage,
    getDashboard,
    getAddProductPage
} = require("../controllers/pageController");

router.get("/", getHome);
router.get("/login", getLoginPage);
router.get("/register", getRegisterPage);
router.get("/products", getShopPage);
router.get("/product-details/:id", getProductDetailsPage);
router.get("/order-success", getOrderSuccessPage);
router.get("/dashboard", isAdmin, getDashboard);
router.get("/add-product", isAdmin, getAddProductPage);

module.exports = router;
