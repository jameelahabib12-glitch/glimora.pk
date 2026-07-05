const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middleware/auth");

const {
    getCheckout,
    postCheckout,
    getOrders,
    updateOrderStatus
} = require("../controllers/orderController");

router.get("/checkout", getCheckout);
router.post("/checkout", postCheckout);
router.get("/orders", isAdmin, getOrders);
router.post("/orders/update-status/:id", isAdmin, updateOrderStatus);

module.exports = router;
