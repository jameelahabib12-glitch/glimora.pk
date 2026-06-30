const session=require("express-session");
const userRoutes=require("./routes/userRoutes");
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const { isLoggedIn, isAdmin } = require("./middleware/auth");

dotenv.config();

const connectDB = require("./config/db");

const app = express();

const productRoutes = require("./routes/productRoutes");

const Product = require("./models/Products");

const Cart = require("./models/Cart");

const User = require("./models/User");

const Order = require("./models/Order");

app.get("/order-success", (req, res) => {
    res.render("order-success");
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use((req,res,next)=>{

    res.locals.session=req.session;

    next();

});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({

    secret: process.env.SESSION_SECRET,

    resave:false,

    saveUninitialized:false

}));

app.use((req, res, next) => {

    res.locals.session = req.session;

    next();

});

app.use(express.static(path.join(__dirname, "public")));
app.use("/api/products", productRoutes);
app.use("/user",userRoutes);
app.get("/", async (req, res) => {
    try {
        const products = await Product.find().sort({ _id: -1 }).limit(4);

        res.render("home", { products });

    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/products", async (req, res) => {
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
});

app.get("/product-details", (req, res) => {
    res.render("product-details");
});

app.get("/checkout", async (req,res)=>{

    try{

        const cartItems = await Cart.find().populate("product");

        let total = 0;

        cartItems.forEach(item=>{
            total += item.product.price * item.quantity;
        });

        res.render("checkout",{
            cartItems,
            total
        });

    }catch(err){

        console.log(err);
        res.status(500).send("Server Error");

    }

});

// Place Order
app.post("/checkout", async (req, res) => {

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

        res.redirect("/order-success");

    } catch (err) {

        console.log(err);
        res.status(500).send("Server Error");

    }

});

app.post("/place-order", async (req,res)=>{

    try{

        const cartItems = await Cart.find().populate("product");

        let total=0;

        const items=[];

        cartItems.forEach(item=>{

            total += item.product.price * item.quantity;

            items.push({

                product:item.product._id,
                quantity:item.quantity

            });

        });

        await Order.create({

            customerName:req.body.name,
            customerEmail:req.body.email,
            items,
            total

        });

        await Cart.deleteMany();

        res.redirect("/orders");

    }catch(err){

        console.log(err);
        res.status(500).send("Server Error");

    }

});

app.get("/dashboard", isAdmin, async (req, res) => {

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

});

app.get("/orders", isAdmin, async (req,res)=>{

    try{

        const orders = await Order.find()
        .populate("items.product")
        .sort({createdAt:-1});

        res.render("orders",{orders});

    }

    catch(err){

        console.log(err);

        res.status(500).send("Server Error");

    }

});

app.get("/add-product", isAdmin, (req, res) => {
    res.render("add-product");
});

app.get("/edit-product/:id", isAdmin, async (req, res) => {

    try {

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).send("Product not found");
        }

        res.render("edit-product", { product });

    } catch (err) {

        console.log(err);
        res.status(500).send("Server Error");

    }

});

app.get("/product-details/:id", async (req, res) => {
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
});

app.get("/cart", async (req, res) => {
    try {

        const cartItems = await Cart.find().populate("product");

        console.log(cartItems);

        res.render("cart", { cartItems });

    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

// Add product to cart
app.post("/cart/add/:id", async (req, res) => {
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

        res.redirect("/cart");

    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

// Remove item from cart
app.get("/cart/remove/:id", async (req, res) => {
    try {
        await Cart.findByIdAndDelete(req.params.id);
        res.redirect("/cart");
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

// Update Order Status
app.get("/orders/status/:id/:status", async (req, res) => {

    try {

        await Order.findByIdAndUpdate(

            req.params.id,

            {

                status: req.params.status

            }

        );

        res.redirect("/orders");

    }

    catch(err){

        console.log(err);

        res.status(500).send("Server Error");

    }

});

app.post("/orders/update-status/:id", isAdmin, async (req, res) => {

    try {

        await Order.findByIdAndUpdate(
            req.params.id,
            {
                status: req.body.status
            }
        );

        res.redirect("/orders");

    } catch (err) {

        console.log(err);
        res.status(500).send("Server Error");

    }

});

if (require.main === module) {
    const PORT = process.env.PORT || 3000;

    connectDB()
        .then(() => {
            app.listen(PORT, () => {
                console.log(`Server running on http://localhost:${PORT}`);
            });
        })
        .catch((err) => {
            console.error("Failed to connect to MongoDB:", err);
            process.exit(1);
        });
}

module.exports = app;