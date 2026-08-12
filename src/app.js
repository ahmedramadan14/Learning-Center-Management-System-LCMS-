const express = require("express");
const cors = require("cors");
const qs = require("qs");

const ApiError = require("./utils/ApiErrors.js");
const globalError = require("./middlewares/errorHandler.js");

const userRoutes = require("./modules/user/user.route.js");
const studentRoutes = require("./modules/student/student.route.js");
const teacherRoutes = require("./modules/teacher/teacher.route.js");
const authRoutes = require("./modules/auth/auth.route.js");
const paymentRoutes = require("./modules/payment/payment.route.js");
const notificationRoutes = require("./modules/notification/notification.route.js");
const attendrouter = require("./modules/attendance/attendance.route.js");
const parentRoutes = require("./modules/parent/parent.route.js");
const ParentStudent = require("./modules/parentStudent/parentStudent.route.js");
const secretarieRoutes = require("./modules/secretaries/secretary.route.js");
const gradeRoutes = require("./modules/grade/grade.route.js");
const groupRoutes = require("./modules/group/group.route.js");
const scheduleRoutes = require("./modules/schedule/schedule.route.js");
const examRoutes = require("./modules/exam/exam.route.js");
const resultRoutes = require("./modules/results/result.route.js");

const app = express();


// =========================================================
// Global Middlewares
// =========================================================

app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true
  })
);

app.use(express.json());

app.set("query parser", (str) => qs.parse(str));


// =========================================================
// Root Route
// =========================================================

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Learning Center Management System API is running"
  });
});


// =========================================================
// Health Check
// =========================================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "LCMS API is running"
  });
});


// =========================================================
// Routes
// =========================================================

app.use("/api/v1/students", studentRoutes);

app.use("/api/v1/teachers", teacherRoutes);

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/users", userRoutes);

app.use("/api/v1/payments", paymentRoutes);

app.use("/api/v1/notifications", notificationRoutes);

app.use("/api/v1/attendance", attendrouter);

app.use("/api/v1/parents", parentRoutes);

app.use("/api/v1/secretaries", secretarieRoutes);

app.use("/api/v1/parentstudent", ParentStudent);

app.use("/api/v1/grades", gradeRoutes);

app.use("/api/v1/groups", groupRoutes);

app.use("/api/v1/schedules", scheduleRoutes);

app.use("/api/v1/exams", examRoutes);

app.use("/api/v1/results", resultRoutes);


// =========================================================
// 404 Handler
// =========================================================

app.use((req, res, next) => {

  next(
    new ApiError(
      `Can't find this route: ${req.originalUrl}`,
      404
    )
  );

});


// =========================================================
// Global Error Handler
// =========================================================

app.use(globalError);


module.exports = app;