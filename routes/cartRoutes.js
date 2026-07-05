const express = require("express");
const router = express.Router();

const {
    getCart,
    addToCart,
    removeFromCart
} = require("../controllers/cartController");

router.get("/", getCart);
router.post("/add/:id", addToCart);
router.get("/remove/:id", removeFromCart);

module.exports = router;
