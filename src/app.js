const express = require("express");
const cors = require("cors");
const qs = require("qs");

const ApiError = require("./utils/ApiErrors");
const globalError = require("./middlewares/errorMiddleware");
const paymentRoutes = require("./modules/payment/payment.route");
const notificationRoutes = require("./modules/notification/notification.route");

const app = express();

// Global Middlewares

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
  extended: true,
}));

app.set("query parser", (str) => qs.parse(str));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "LCMS API is running",
  });
});

app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);

//    404 Handler

app.use((req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 404));
});

//    Global Error Handler

app.use(globalError);

module.exports = app;
