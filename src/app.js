const express = require("express");
const cors = require("cors");
const qs = require("qs");

const ApiError = require("./utils/ApiErrors");


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


//    404 Handler

app.use((req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 404));
});

//    Global Error Handler

// app.use(globalError);

module.exports = app;
