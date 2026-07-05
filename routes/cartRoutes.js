const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware/auth");

const {
    getCart,
    addToCart,
    removeFromCart
} = require("../controllers/cartController");

router.get("/", isLoggedIn, getCart);
router.post("/add/:id", isLoggedIn, addToCart);
router.get("/remove/:id", isLoggedIn, removeFromCart);

module.exports = router;