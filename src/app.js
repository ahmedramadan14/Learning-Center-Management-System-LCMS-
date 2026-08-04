const express = require("express");
const cors = require("cors");
const qs = require("qs");

const ApiError = require("./utils/ApiErrors");
const globalError = require("./middlewares/errorMiddleware");

const userRoutes = require("./routes/user.routes");
const productRoutes = require("./routes/product.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();

// Global Middlewares

// app.use(cors({
//   origin: "*",
//   methods: "*",
// }));

app.use(express.json());

app.use(express.urlencoded({
  extended: true,
}));

app.set("query parser", (str) => qs.parse(str));


app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);

//    404 Handler

app.use((req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 404));
});

//    Global Error Handler

// app.use(globalError);

module.exports = app;