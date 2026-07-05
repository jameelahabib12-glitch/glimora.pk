const express = require("express");
const router = express.Router();
const { isAdmin, isLoggedIn } = require("../middleware/auth");

const {
    getCheckout,
    postCheckout,
    getOrders,
    updateOrderStatus
} = require("../controllers/orderController");

router.get("/checkout", isLoggedIn, getCheckout);
router.post("/checkout", isLoggedIn, postCheckout);
router.get("/orders", isAdmin, getOrders);
router.post("/orders/update-status/:id", isAdmin, updateOrderStatus);

module.exports = router;