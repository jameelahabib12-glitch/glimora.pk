const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const session = require("express-session");

dotenv.config();

const connectDB = require("./config/db");

const pageRoutes = require("./routes/pageRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("trust proxy", 1);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    cookie: {
        secure: false,
        httpOnly: true,
        sameSite: "lax"
    }
}));

app.use((req, res, next) => {

    res.locals.session = req.session;

    next();

});

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/products", productRoutes);
app.use("/user", userRoutes);
app.use("/cart", cartRoutes);
app.use("/", orderRoutes);
app.use("/", pageRoutes);

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
