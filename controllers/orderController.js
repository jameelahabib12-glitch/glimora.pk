const Product = require("../models/Products");
const Cart = require("../models/Cart");
const Order = require("../models/Order");

// CHECKOUT PAGE
const getCheckout = async (req, res) => {

    try {

        const cartItems = await Cart.find().populate("product");

        let total = 0;

        cartItems.forEach(item => {
            total += item.product.price * item.quantity;
        });

        res.render("checkout", {
            cartItems,
            total
        });

    } catch (err) {

        console.log(err);
        res.status(500).send("Server Error");

    }

};

// PLACE ORDER
const postCheckout = async (req, res) => {

    try {

        const { customerName, customerEmail, phone, address } = req.body;

        const cartItems = await Cart.find().populate("product");

        if (cartItems.length === 0) {
            return res.send("Your cart is empty.");
        }

        let totalAmount = 0;
        const orderItems = [];

        cartItems.forEach(item => {

            if (!item.product) return;

            totalAmount += item.product.price * item.quantity;

            orderItems.push({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price
            });

        });

        await Order.create({

            customerName,
            customerEmail,
            phone,
            address,

            items: orderItems,

            totalAmount,

            status: "Pending"

        });

        // Reduce stock after successful order

for (const item of cartItems) {

    await Product.findByIdAndUpdate(

        item.product._id,

        {
            $inc: {
                stock: -item.quantity
            }
        }

    );

}

        // Empty the cart
        await Cart.deleteMany({});

        res.redirect(303, "/order-success");

    } catch (err) {

        console.log(err);
        res.status(500).send("Server Error");

    }

};

// ADMIN: LIST ORDERS
const getOrders = async (req, res) => {

    try {

        const orders = await Order.find()
        .populate("items.product")
        .sort({createdAt:-1});

        res.render("orders",{orders});

    }

    catch(err){

        console.log(err);

        res.status(500).send("Server Error");

    }

};

// ADMIN: UPDATE ORDER STATUS
const updateOrderStatus = async (req, res) => {

    try {

        await Order.findByIdAndUpdate(
            req.params.id,
            {
                status: req.body.status
            }
        );

        res.redirect(303, "/orders");

    } catch (err) {

        console.log(err);
        res.status(500).send("Server Error");

    }

};

module.exports = {
    getCheckout,
    postCheckout,
    getOrders,
    updateOrderStatus
};
