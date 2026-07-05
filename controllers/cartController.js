const Product = require("../models/Products");
const Cart = require("../models/Cart");

// VIEW CART
const getCart = async (req, res) => {
    try {

        const cartItems = await Cart.find().populate("product");
        const invalidItemIds = cartItems
            .filter(item => !item.product)
            .map(item => item._id);

        if (invalidItemIds.length > 0) {
            await Cart.deleteMany({ _id: { $in: invalidItemIds } });
        }

        const validCartItems = cartItems.filter(item => item.product);

        res.render("cart", { cartItems: validCartItems });

    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
};

// ADD PRODUCT TO CART
const addToCart = async (req, res) => {
    try {
        const productId = req.params.id;

        const product = await Product.findById(productId);

if(!product){

    return res.send("Product not found");

}

if(product.stock <= 0){

    return res.send("This product is out of stock.");

}

        const existingItem = await Cart.findOne({ product: productId });

       if(existingItem){

    if(existingItem.quantity >= product.stock){

        return res.send("No more stock available.");

    }

    existingItem.quantity += 1;

    await existingItem.save();

}
        else {
            await Cart.create({
                product: productId,
                quantity: 1
            });
        }

        res.redirect(303, "/cart");

    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
};

// REMOVE ITEM FROM CART
const removeFromCart = async (req, res) => {
    try {
        await Cart.findByIdAndDelete(req.params.id);
        res.redirect("/cart");
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
};

module.exports = {
    getCart,
    addToCart,
    removeFromCart
};
