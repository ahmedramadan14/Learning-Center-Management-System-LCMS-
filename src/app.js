const express = require("express");
const cors = require("cors");
const qs = require("qs");

const ApiError = require("./utils/ApiErrors");
const globalError = require("./middlewares/errorHandler");

const user = require("./modules/user/user.route")
const student = require("./modules/student/student.route")
const teacher = require("./modules/teacher/teacher.route")
const auth = require("./modules/auth/auth.route")


const app = express();

app.use(express.json());


// app.set("query parser", (str) => qs.parse(str));
app.use("/api/v1/students", student);
app.use("/api/v1/teachers", teacher);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", user);

//    404 Handler'
app.use((req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 404));
});

//    Global Error Handler

app.use(globalError)

module.exports = app;