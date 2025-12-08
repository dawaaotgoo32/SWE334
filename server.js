require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { connectDB } = require("./db");


const PORT = 4000;

const errorHandler = require("./middleware/error");
const logger = require("./middleware/logger");

const categoriesRoutes = require("./routes/categories");
const authRoutes = require("./routes/auth");
const appRoutes = require("./routes/app");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");
const paymentRoutes = require("./routes/payment");
const brandRoutes = require("./routes/brands");
const shipmentRoutes = require("./routes/shipments");

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(logger);

app.use("/api/shipments", shipmentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/product", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", appRoutes);


app.use(errorHandler);

(async () => {
    await connectDB();
    app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
})();
